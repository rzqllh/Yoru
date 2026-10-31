-- Optional Yoru cross-device snapshots.
-- Apply ONLY to a dedicated, authorized Supabase staging project first.
-- The private schema must NOT be exposed through Supabase Data API.

create schema if not exists yoru_private;
revoke all on schema yoru_private from public, anon;
grant usage on schema yoru_private to authenticated;

create table if not exists public.yoru_sync_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint yoru_sync_payload_shape check (
    jsonb_typeof(payload) = 'object'
    and payload ->> 'version' = '1'
    and jsonb_typeof(payload -> 'library') = 'array'
    and jsonb_typeof(payload -> 'progress') = 'array'
    and (not payload ? 'preferences'
         or jsonb_typeof(payload -> 'preferences') = 'array')
    and octet_length(payload::text) <= 524288
  )
);

alter table public.yoru_sync_snapshots enable row level security;
-- No direct table writes by browser clients. All mutations must go through
-- the revision-checked RPCs and obtain the current caller with auth.uid().
revoke all on table public.yoru_sync_snapshots from public, anon, authenticated;
grant select on public.yoru_sync_snapshots to authenticated;

create policy "yoru_sync_select_own" on public.yoru_sync_snapshots
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Privileged SQL is isolated in a schema NOT exposed through Data API.
-- Only the caller's authenticated uid is ever used as the row key.
create or replace function yoru_private.sync_put(
  expected_revision bigint, next_payload jsonb
) returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
  new_revision bigint;
begin
  owner_id := (select auth.uid());
  if owner_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if expected_revision is null or expected_revision < 0 then
    raise exception 'INVALID_REVISION';
  end if;
  if next_payload is null or
    jsonb_typeof(next_payload) <> 'object' or
    next_payload ->> 'version' <> '1' or
    jsonb_typeof(next_payload -> 'library') <> 'array' or
    jsonb_typeof(next_payload -> 'progress') <> 'array' or
    (next_payload ? 'preferences'
     and jsonb_typeof(next_payload -> 'preferences') <> 'array') or
    octet_length(next_payload::text) > 524288 then
    raise exception 'INVALID_PAYLOAD';
  end if;

  -- Revision 0 may only create an absent row; an existing row must never
  -- be overwritten. Nonzero revisions update exactly the observed version.
  if expected_revision = 0 then
    insert into public.yoru_sync_snapshots
      (user_id, payload, revision, updated_at)
    values (owner_id, next_payload, 1, now())
    on conflict (user_id) do nothing
    returning revision into new_revision;
  else
    update public.yoru_sync_snapshots
    set payload = next_payload,
        revision = revision + 1,
        updated_at = now()
    where user_id = owner_id and revision = expected_revision
    returning revision into new_revision;
  end if;

  if new_revision is null then raise exception 'SYNC_CONFLICT'; end if;
  return new_revision;
end;
$$;
revoke all on function yoru_private.sync_put(bigint,jsonb)
  from public, anon, authenticated;
grant execute on function yoru_private.sync_put(bigint,jsonb)
  to authenticated;

create or replace function yoru_private.sync_delete()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
  deleted boolean;
begin
  owner_id := (select auth.uid());
  if owner_id is null then raise exception 'AUTH_REQUIRED'; end if;
  delete from public.yoru_sync_snapshots where user_id = owner_id;
  deleted := found;
  return deleted;
end;
$$;
revoke all on function yoru_private.sync_delete()
  from public, anon, authenticated;
grant execute on function yoru_private.sync_delete()
  to authenticated;

-- Only narrow, SECURITY INVOKER wrappers are exposed via /rest/v1/rpc.
-- They cannot directly modify tables, and need the caller's permission
-- to execute the private functions.
create or replace function public.yoru_sync_put(
  expected_revision bigint, next_payload jsonb
) returns bigint
language sql
security invoker
set search_path = ''
as $$
  select yoru_private.sync_put(expected_revision, next_payload);
$$;
revoke all on function public.yoru_sync_put(bigint,jsonb)
  from public, anon, authenticated;
grant execute on function public.yoru_sync_put(bigint,jsonb)
  to authenticated;

create or replace function public.yoru_sync_delete()
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select yoru_private.sync_delete();
$$;
revoke all on function public.yoru_sync_delete()
  from public, anon, authenticated;
grant execute on function public.yoru_sync_delete()
  to authenticated;

-- Acceptance on staging must exercise two real authenticated identities,
-- one anonymous client, direct-write rejection and optimistic conflict.
-- No service-role credential may be included in a browser build.
