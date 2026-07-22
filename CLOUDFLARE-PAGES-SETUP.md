# Cloudflare Pages setup

Build command: `npm run build`

Build output directory: `dist`

Root directory: leave blank

Production branch: `main`

Environment variables / secrets:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
GEMINI_API_KEY
```

The VITE variables must exist before the build. API tokens are accessed only by `/functions/api/ai.js` at runtime.
