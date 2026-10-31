# Cross-device synchronization (opt-in preview)

**Stage: CODED, NOT LIVE VERIFIED.** This is an operator-configured, optional
manual snapshot transfer using Supabase Auth and PostgreSQL RLS. Without the
environment variables and database migration, no authentication request or
cloud connection is made, and Yoru continues working offline with IndexedDB.

## Experience

1. In **Pengaturan → Akun & perangkat**, enter the same email on both devices.
2. Receive an email one-time code and sign in. Tokens are kept in **tab memory**
   only and not written into browser preferences or exported backups. Reload
   requires signing in again.
3. On the source device select **Unggah**. If the account already has a snapshot,
   the user must explicitly confirm replacement.
4. On the destination select **Unduh** and confirm importing. It *merges*
   imported records using existing backup v1 semantics. Library and playback
   progress prefer the record with the newer `updatedAt` timestamp (local wins
   ties). Matching preferences are explicitly replaced from cloud because
   backup v1 preferences have no update timestamp. Deletes are **not** propagated.
5. **Hapus cloud** deletes the account's remote snapshot only. Local browser
   data remains until separately deleted.

There is no automatic background synchronization, multi-device real-time
subscription, guaranteed conflict-free merge, cloud encryption using
user-managed keys, or cross-device stream URL transfer in this first stage.
Concurrent uploads use database revision compare-and-swap: a conflict is
reported instead of silently replacing an unobserved revision.

## Operator setup

Provision a Supabase project owned by the operator. Apply the reviewed migration:
`supabase/migrations/20261031072944_yoru_device_sync_initial.sql`. It creates one
`yoru_sync_snapshots` row per authenticated user, an account-scoped RLS
SELECT policy, and RPC-only writes/deletion with optimistic-revision checks.
Direct PostgREST INSERT/UPDATE/DELETE permissions are not granted.
Privileged functions live in the non-exposed `yoru_private` schema with pinned
empty search paths and caller-scoped `auth.uid()` checks. Only narrow
`SECURITY INVOKER` public RPC wrappers are callable by authenticated users.
Never add `yoru_private` to Supabase's exposed schemas. Verify both authorization
and optimistic conflict behavior on a staging database before enabling this UI.

Configure **email OTP** templates with `{{ .Token }}`, approved Auth redirect
allow-list and a functioning SMTP sender. Default project email delivery is
limited and not a substitute for production SMTP.

Add only public browser configuration to `frontend/.env.local` (ignored by Git):

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

Do **not** use service-role, secret or management keys in frontend environment
variables. Only modern `sb_publishable_...` keys are accepted by the sync client; legacy
JWT keys and `sb_secret_...` credentials are deliberately rejected to avoid
accidental privileged-key exposure in the browser. The publishable key is
public by design and does not replace row-level authorization. An authenticated access token is required for snapshot requests.

Rebuild the frontend after changing `VITE_*` variables. The backend currently
does not serve the Auth endpoints: the browser talks directly to the configured
Supabase project over HTTPS.

## Data and security

Cloud data includes only anime ID/title plus library status and watch
progress, and canonicalized, whitelisted preferences (including bounded source
provider identities and manual Watch Guide progress). Third-party metadata
such as posters, covers, synopses and stream URLs is **not** uploaded. The
existing backup import reconstructs safe local anime models and the catalog may
reload remaining artwork from its provider. Unknown/malformed preferences are
discarded. Content is protected from other users by RLS, but stored in
Supabase under the project operator's administrative control; this is **not**
end-to-end encrypted.

Limit: 500 kB per snapshot client-side, 512 KiB database-side. On any request
failure, local IndexedDB data remains available. Signing out only clears the
in-memory UI session; browser-cached data is not deleted.

### Required acceptance before enabling real accounts

- Apply schema on an isolated test project and run database RLS checks for
  two different authenticated accounts plus an anonymous role; verify each
  account cannot read, write or delete the other's data.
- Verify login, OTP delivery/quota, token expiry, upload, download, deletion,
  conflict handling and corrupted remote payload rejection on **two devices**.
- Verify privacy notice, account deletion/export process, CSP/CORS, abuse
  budgets, project credentials and disaster recovery/backup.
- Record actual results in [release gate #20](https://github.com/rzqllh/Yoru/issues/20).
  Never mark LIVE_VERIFIED based only on mocked GitHub Actions fixtures.

Reference: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless),
[JavaScript OTP](https://supabase.com/docs/reference/javascript/auth-verifyotp).

## Two-account live acceptance harness

After configuring a dedicated test project and signing in two distinct **test
accounts**, use `node scripts/verify-device-sync-live.mjs`. It requires
`YORU_SYNC_TEST_URL`, `YORU_SYNC_TEST_PROJECT_REF`,
`YORU_SYNC_TEST_PUBLISHABLE_KEY`, and the two temporary access tokens in
`YORU_SYNC_TEST_TOKEN_A` / `YORU_SYNC_TEST_TOKEN_B` environment variables.
Never commit tokens or paste them into public issues. Use short-lived sessions.

The harness refuses non-HTTPS or mismatched projects, requires independently
verified accounts and **empty existing snapshots**, checks anonymous denial,
per-user row visibility, stale revision conflicts and account-scoped RPC writes,
then deletes only snapshots created by that test. Missing credentials cause
an immediate nonzero exit code without network traffic. Run it only with
explicit staging-test authorization. Verify the project is still empty
following cleanup. Real browser/OTP email acceptance is **additional** to
this script and cannot be inferred from CI mocks.

## Prepared payload validation correction

Read-only staging inspection on 31 October 2026 found that missing JSON keys evaluate to SQL NULL in the original CHECK/RPC validation. This can admit an incomplete snapshot; it is not evidence of cross-account access. The additive migration `supabase/migrations/20261031131903_yoru_sync_required_payload_fields.sql` requires the payload shape expression to be TRUE and uses NULL-safe RPC checks. It preserves existing rows, RLS policies and grants. The original migration filename is aligned with the deployed ledger version `20261031072944`; its SQL is unchanged.

This correction is prepared for review and **has not been applied to Supabase**. Before applying it, audit existing rows with the new expression and stop if any are invalid; do not delete or rewrite user snapshots. Apply only after explicit approval to the dedicated Yoru staging project, then run the two-account harness and real OTP/browser checks. Portable PostgreSQL/WASM tests simulate roles and claims and cannot prove email authentication, Data API exposure or two-device behavior.
