# DocLingo AI V28 — Secure Admin Dashboard

## Added
- Admin-only platform statistics.
- Recent user list with balances and roles.
- Secure credit adjustments with mandatory reason and transaction ledger.
- Admin controls are hidden from normal users.
- Every admin RPC verifies the signed-in user’s role server-side.

## Setup
1. Run `supabase-migration-v28.sql` in Supabase SQL Editor.
2. Run this separately after replacing the email:
```sql
update public.profiles set role='admin' where email='YOUR_EMAIL@example.com';
```
3. Sign out and sign in again.
4. Upload this package and redeploy Netlify without cache.
