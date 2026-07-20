# DocLingo AI V25 — Accounts & Real Credits

## Added
- Supabase profile for every user.
- 5 welcome Credits for new and existing users.
- Credits stored in PostgreSQL for signed-in users.
- Secure RPC for spending Credits.
- Reward Credit claim protected by a 30-second database cooldown.
- Credit transaction ledger, tool usage and AI-result tables.
- RLS policies so every user accesses only their own records.
- Logged-out users retain the local beta wallet.

## Required setup
1. Open Supabase > SQL Editor > New query.
2. Paste the full contents of `supabase-schema-v25.sql`.
3. Select Run.
4. Upload this V25 package and redeploy Netlify without cache.

## Existing Netlify variables remain unchanged.
