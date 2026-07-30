# Fluency Instrument

A static Sprint 1 MVP for the AI Fluency Assessment and Path Recommender.

## What is included

- Warm paper-style visual system
- Live dial that fills as answers are entered
- Simple 6-factor weighted assessment mapped to a 1-100 AI fluency score
- Goal-driven track recommendation
- Time-based pacing note and duration estimate
- Week-by-week module list
- Result reset / retake flow
- Supabase-backed result sync for completed assessments

## How to open

Open `index.html` in a browser, or serve the folder with any static file server.
For Supabase syncing, use an `http://` or `https://` origin rather than `file://`.

## Notes

- The app is intentionally dependency-free so it can run directly from the workspace.
- Results are computed instantly in the browser.
- Completed assessments are inserted into the connected Supabase project in
  `public.assessments` using the project publishable key.
