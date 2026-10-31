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
   imported records using existing backup v1 semantics; matching IDs can be
   overwritten, and deletes are **not** automatically propagated.
5. **Hapus cloud** deletes the account's remote snapshot only. Local browser
   data remains until separately deleted.

There is no automatic background synchronization, multi-device real-time
subscription, guaranteed conflict-free merge, cloud encryption using
user-managed keys, or cross-device stream URL transfer in this first stage.
Concurrent uploads use database revision compare-and-swap: a conflict is
reported instead of silently replacing an unobserved revision.

## Operator setup

Provision a Supabase project owned by the operator. Apply the reviewed migration:
`supabase/migrations/20261031_yoru_device_sync.sql`. It creates one
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
variables. The publishable key is public by design and does not replace row-level
authorization. An authenticated access token is required for snapshot requests.

Rebuild the frontend after changing `VITE_*` variables. The backend currently
does not serve the Auth endpoints: the browser talks directly to the configured
Supabase project over HTTPS.

## Data and security

Cloud data includes selected anime library metadata, watch progress and
canonicalized, whitelisted preference keys (including bounded source-provider identity and manual
Watch Guide progress). Raw stream URLs and access tokens are not intentionally
synced; unknown or malformed preference values are discarded. Anime metadata
may still include poster and cover image URLs, which are included in snapshots. Content is protected from other users by RLS, but stored in
Supabase under the project owner's administrative control; this is not
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
