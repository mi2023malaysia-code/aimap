# DISC Assessment Prototype

This repository contains a standalone, local DISC web app prototype built from the PRD.

## What it does

- Captures identity details on the first screen.
- Randomly selects 10 questions from a 30-question DISC bank.
- Splits the assessment into 3-question pages with back/next navigation.
- Computes 1-100 DISC scores and renders a radar chart.
- Shows static career and self-improvement guidance for the dominant profile.
- Logs every transition, answers, scores, and feedback to Supabase when configured.
- Seeds a 30-question bank on the first assessment start and samples 10 questions per session.

## Run locally

1. Start the server:

   ```bash
   npm start
   ```

2. Open the app:

   ```text
   http://localhost:3000
   ```

## Deploy to Vercel

This repo is already structured for Vercel:

- `index.html` is the site entrypoint.
- `public/` contains the CSS and browser JavaScript.
- `api/` contains the serverless endpoints used by the app.

To publish it:

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Use the default settings, or choose:
   - Framework preset: `Other`
   - Build command: none
   - Output directory: default
4. Deploy.

You can also use the CLI:

```bash
vercel login
vercel
vercel --prod
```

## Supabase setup

The app expects these environment variables in Supabase-backed mode:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`

Use your Supabase project URL for `SUPABASE_URL`, for example `https://eskeehlttaiigpzrllxk.supabase.co`.
If you already have the REST base URL ending in `/rest/v1/`, that also works because the app builds the REST paths from the base.
For local development, you can place the values in a root `.env` file and start the server normally with `npm start`.
If your default Node install cannot verify Supabase's TLS certificate on Windows, run the bundled Codex Node binary with `--use-system-ca` instead.

A starter template is available in [`.env.example`](C:/Users/pc/Documents/106a/.env.example).

Before first use, run the SQL in `supabase/migrations/20260717_initial_schema.sql` in your Supabase project. The app will seed the 30-question bank automatically the first time an assessment starts.

## Data storage

- In Supabase mode, each assessment action writes a new row to `assessment_events`, and the current session snapshot is stored in `assessment_sessions`.
- If Supabase env vars are not set, the app falls back to `data/assessments-runtime.json` for local development.
- The local file is ignored by Git so testing does not dirty the working tree.

## Notes

- The prototype uses static, prewritten content and does not call an AI model.
- No email is sent.
- The assessment is intended as a one-off, no-login flow.
