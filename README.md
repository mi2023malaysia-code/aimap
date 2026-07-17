# DISC Assessment Prototype

This repository contains a standalone, local DISC web app prototype built from the PRD.

## What it does

- Captures identity details on the first screen.
- Randomly selects 10 questions from a larger DISC question bank.
- Splits the assessment into 3-question pages with back/next navigation.
- Computes 1-100 DISC scores and renders a radar chart.
- Shows static career and self-improvement guidance for the dominant profile.
- Logs every transition, answers, scores, and feedback to a local JSON file.

## Run locally

1. Start the server:

   ```bash
   node server.js
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

## Data storage

- When you run `node server.js`, runtime logs are written to `data/assessments-runtime.json`.
- On Vercel, the API is stateless and computes the report from the answers the browser submits.
- The file is ignored by Git so local testing does not dirty the working tree.

## Notes

- The prototype uses static, prewritten content and does not call an AI model.
- No email is sent.
- The assessment is intended as a one-off, no-login flow.
