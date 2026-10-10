# Mayura Jewellers — Spin & Win

## 1. Create the database table
1. Open your Supabase project.
2. Go to **SQL Editor → New query**.
3. Copy and run all of `supabase.sql`.
4. Open **Table Editor → customer_claims** to see claims after deployment.

## 2. Add Vercel environment variables
In Vercel, open the project → **Settings → Environment Variables** and add these for Production (and Preview if needed):

- `SUPABASE_URL` = `https://xfoenrqkupstytafytbd.supabase.co`
- `SUPABASE_SECRET_KEY` = your **newly rotated** Supabase secret key

Do not use a `VITE_` prefix for the secret. Do not put the secret in `index.html`, any browser JavaScript, Git, or a public repository. Redeploy after adding the variables.

## 3. Deploy
Upload/push the contents of this folder to the Git repository connected to Vercel. The root directory should be this project folder. No build command is required; the site is `index.html` and Vercel runs `api/claim.js` as a serverless function.

For local development, install Node.js, then run:

```bash
npm install
npx vercel dev
```

Open the local URL printed by Vercel CLI. The `/api/claim` function needs the environment variables above; use a local `.env.local` file (copy `.env.example`, fill it in) and never commit it.

## Important security note
The secret key included in a chat message should be treated as exposed. Rotate/revoke it in Supabase and use the replacement only as the Vercel `SUPABASE_SECRET_KEY` environment variable. The publishable key is intended for browser use, but this project doesn't need it in the frontend because writes go through the Vercel API.

The wheel's one-spin lock is browser-local (`localStorage`), matching the provided original code. It is not a verified one-spin-per-person system: a visitor can clear browser storage or use another device. The API validates the prize against the allowed list and generates the redemption code server-side, but it cannot prove that the wheel was genuinely spun because the current design sends the selected prize from the browser. For a public promotion that must prevent tampering or repeated spins, implement server-side spin/session validation and rate limiting before launch.
