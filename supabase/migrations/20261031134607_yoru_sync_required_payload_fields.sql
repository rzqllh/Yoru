-- Prepared correction for dedicated Yoru staging only. Do not apply without review.
-- PostgreSQL CHECK accepts NULL; missing JSON keys must explicitly fail closed.
-- Additive: preserve the original constraint, grants, policies and stored rows.
alter table public.yoru_sync_snapshots
  add constraint yoru_sync_required_payload_fields check ((
    jsonb_typeof(payload) = 'object'
    and payload ->> 'version' = '1'
    and jsonb_typeof(payload -> 'library') = 'array'
    and jsonb_typeof(payload -> 'progress') = 'array'
    and (not payload ? 'preferences' or jsonb_typeof(payload -> 'preferences') = 'array')
    and octet_length(payload::text) <= 524288
  ) is true);

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
    jsonb_typeof(next_payload) is distinct from 'object' or
    next_payload ->> 'version' is distinct from '1' or
    jsonb_typeof(next_payload -> 'library') is distinct from 'array' or
    jsonb_typeof(next_payload -> 'progress') is distinct from 'array' or
    (next_payload ? 'preferences'
     and jsonb_typeof(next_payload -> 'preferences') is distinct from 'array') or
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
