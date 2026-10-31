-- Opt-in, per-account snapshot synchronization. Apply to a dedicated Supabase
-- project only after reviewing RLS and provider data handling.
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
  and (not payload ? 'preferences' or jsonb_typeof(payload -> 'preferences') = 'array')
  and octet_length(payload::text) <= 524288
 )
);
alter table public.yoru_sync_snapshots enable row level security;
revoke all on table public.yoru_sync_snapshots from public, anon, authenticated;
grant select, insert, update, delete on public.yoru_sync_snapshots to authenticated;

create policy "yoru_sync_select_own" on public.yoru_sync_snapshots
 for select to authenticated using (user_id = (select auth.uid()));
create policy "yoru_sync_insert_own" on public.yoru_sync_snapshots
 for insert to authenticated with check (user_id = (select auth.uid()));
create policy "yoru_sync_update_own" on public.yoru_sync_snapshots
 for update to authenticated using (user_id = (select auth.uid()))
 with check (user_id = (select auth.uid()));
create policy "yoru_sync_delete_own" on public.yoru_sync_snapshots
 for delete to authenticated using (user_id = (select auth.uid()));

-- Compare-and-swap prevents simultaneous devices overwriting an unobserved
-- remote revision. Users explicitly choose to upload/download a snapshot.
create or replace function public.yoru_sync_put(
 expected_revision bigint, next_payload jsonb
) returns bigint
language plpgsql security invoker
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
  (next_payload ? 'preferences' and jsonb_typeof(next_payload -> 'preferences') <> 'array') or
  octet_length(next_payload::text) > 524288 then
  raise exception 'INVALID_PAYLOAD';
 end if;
 insert into public.yoru_sync_snapshots as snapshot
  (user_id, payload, revision, updated_at)
 values (owner_id, next_payload, 1, now())
 on conflict (user_id) do update set
  payload = excluded.payload,
  revision = snapshot.revision + 1,
  updated_at = now()
 where snapshot.revision = expected_revision
 returning revision into new_revision;
 if new_revision is null then raise exception 'SYNC_CONFLICT'; end if;
 return new_revision;
end;
$$;
revoke all on function public.yoru_sync_put(bigint,jsonb) from public, anon;
grant execute on function public.yoru_sync_put(bigint,jsonb) to authenticated;

-- RLS must be tested with two distinct authenticated identities and anonymous
-- access denied before production. No service_role credential belongs in UI.
