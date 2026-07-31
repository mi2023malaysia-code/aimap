# Fluency Instrument Test Results

Date: 2026-07-31

## Summary

Executed the manual end-to-end regression for the AI Fluency Assessment flow on the local HTTP build at `http://127.0.0.1:4173/`.

Result: pass.

## Environment

- Browser: Chromium via the in-app browser
- Local URL: `http://127.0.0.1:4173/`
- App type: static HTML / CSS / JavaScript wizard
- Supabase config: present in `supabase.config.js`

## Executed Flow

1. Opened the app intro screen.
2. Started the self-assessment wizard.
3. Completed the profile step with valid sample data.
4. Marked that a paid AI tool is used and entered `ChatGPT`.
5. Selected current tools: `ChatGPT` and `Claude`.
6. Chose weekly time commitment: `3-6 hours`.
7. Chose goal: `Build a product or side project`.
8. Entered weighted assessment ratings:
   - Tool breadth: `4`
   - Prompt quality and task framing: `4`
   - Verification and judgment: `3`
   - Workflow integration: `4`
   - Automation / building ability: `3`
   - Time & cost commitment: `4`
9. Marked formal paid training as completed and entered `Coursera: AI for Product Managers`.
10. Submitted the assessment and verified the result page.
11. Clicked retake and verified the wizard reset to the intro state.

## Observed Outcome

| Check | Expected | Observed | Status |
| --- | --- | --- | --- |
| Intro render | Intro page visible with start CTA | Intro page rendered correctly | Pass |
| Wizard progression | Advance page by page | Progressed through all 9 steps | Pass |
| Required fields | Validation blocks missing inputs | Required inputs were accepted when filled | Pass |
| Weighted score | 70/100 for the reference case | 70/100 | Pass |
| Track | Builder Track | Builder Track | Pass |
| Duration | 7 weeks at 4 hrs/week | 7 weeks at 4 hrs/week | Pass |
| Supabase sync | Saved state after submit | `Saved to Supabase and ready for reporting.` | Pass |
| Result lock | Read-only after submit | No further edits permitted | Pass |
| Retake flow | Reset to clean intro state | Returned to intro with `1 of 9` and `0%` progress | Pass |

## Reference Inputs

- Name: `Amina Tan`
- Email: `amina.tan@example.com`
- Role / background: `Product manager`
- Objective: `Support a product or side project`
- Pain points: `No clear starting point`, `I need better prompts and workflows`
- Paid tool: `ChatGPT`
- Tools: `ChatGPT`, `Claude`
- Weekly time: `3-6 hours`
- Goal: `Build a product or side project`
- Training: `Coursera: AI for Product Managers`

## Notes

- The final score and roadmap matched the expected regression reference exactly.
- The retake button returned the app to a clean intro state, confirming state reset behavior.
- No blocking UI or flow defects were encountered during the run.
- After renaming the live Supabase table to `public."115_assessments"`, the same reference submission saved successfully again.
- A fresh retest after the underscore rename still passed with the same `70/100` Builder Track result and a successful Supabase sync.
- Retested the renamed-table flow again and it still passed with the same `70/100` Builder Track result and successful Supabase sync.
