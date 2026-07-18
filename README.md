# DocLingo AI V22.1 — Multi-AI Free Fallback

## Provider order
1. Cloudflare Workers AI
2. Gemini API fallback

The server switches automatically when a provider is unavailable, rate-limited, timed out, or out of free quota. Credits are deducted only after a successful result.

## Required Netlify variables
```text
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
GEMINI_API_KEY=your_key
```

Optional:
```text
CLOUDFLARE_MODEL=@cf/meta/llama-3.1-8b-instruct
GEMINI_MODEL=gemini-2.5-flash-lite
```

No OpenAI credit is required for this version.
