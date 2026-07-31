# Fluency Instrument Test Plan

Created: 2026-07-31

## Purpose

Validate the Sprint 1 Fluency Instrument webapp from first load through final result, including scoring, roadmap generation, Supabase sync, reset behavior, and responsive layout.

## Scope

- Intro page and start CTA
- 9-step wizard navigation
- Conditional fields for paid tools and training history
- Tool selection behavior, including exclusive options
- Weekly time and goal selection
- Weighted AI fluency score calculation
- Track recommendation and duration estimate
- Week-by-week module generation
- Result lock state and retake flow
- Supabase submission and retry messaging
- Desktop and mobile usability
- Basic keyboard and accessibility checks

## Out Of Scope

- User accounts and authentication
- Long-term persistence outside the Supabase insert
- Analytics dashboards or reporting views
- Content expansion beyond the current roadmap logic
- Automated test framework setup

## Test Environment

- Browser: Chromium or Chrome
- Host: local HTTP server
- Preferred local URL: `http://127.0.0.1:4173/`
- Do not use `file://` for Supabase sync verification
- Mobile viewport check: 390 x 844
- Optional negative network checks: blocked network or invalid Supabase config

## Entry Criteria

- The app loads successfully from a local HTTP origin
- `supabase.config.js` is present and points to the connected project
- No blocking runtime errors are visible in the browser console

## Exit Criteria

- All P0 and P1 cases pass
- No critical navigation, scoring, or sync defects remain
- Retake flow returns the user to a clean intro state
- Mobile layout remains usable without horizontal scrolling

## Test Data

| ID | Persona | Inputs | Expected Outcome |
| --- | --- | --- | --- |
| TD-01 | Beginner | No paid tool, few tools, low ratings, 1-3 hours, curiosity | Low score, beginner band, shorter roadmap |
| TD-02 | Builder | Paid ChatGPT, ChatGPT + Claude, 3-6 hours, product/side project goal, medium ratings, prior training yes | Builder Track, mid score, 7-week roadmap |
| TD-03 | Advanced | Multiple tools, 6+ hours, high ratings, formal training yes | Advanced band, longer roadmap, advanced module list |
| TD-04 | Validation | Missing required field on the current page | Inline error and blocked navigation |

## Smoke Test Sequence

1. Open the app on a local HTTP server.
2. Confirm the intro page renders and the start CTA is visible.
3. Complete the profile page with valid data.
4. Complete the paid tool and tools pages.
5. Select weekly time and goal.
6. Answer all six assessment ratings.
7. Complete the training page and submit the result.
8. Confirm the result page locks, the score displays, and Supabase sync finishes.
9. Click retake and confirm the app resets to the intro state.

## Functional Test Cases

| ID | Area | Steps | Expected Result |
| --- | --- | --- | --- |
| FT-01 | App load | Open the app on `http://127.0.0.1:4173/` | Intro page renders with title, CTA, and live dial |
| FT-02 | Start flow | Click the start CTA | Wizard advances to the profile page |
| FT-03 | Profile validation | Leave required fields blank and click Continue | Validation message appears and page does not advance |
| FT-04 | Profile capture | Enter name, email, role/background, objective, and pain points | Inputs persist in the live preview and the next step unlocks |
| FT-05 | Paid tool conditional | Select Yes on the paid-tool page | Paid tool name field appears and is required |
| FT-06 | Paid tool no path | Select No on the paid-tool page | No paid tool name field is required |
| FT-07 | Tool selection | Select multiple tools | Live preview reflects the chosen stack |
| FT-08 | Exclusive tools | Select None or Other on the tools page | None clears other tools; Other reveals the free-text field |
| FT-09 | Time selection | Choose a weekly time band | Duration estimate and pacing note update |
| FT-10 | Goal selection | Choose a goal such as Build a product or side project | Track name and track description update |
| FT-11 | Score calculation | Complete all six assessment ratings with a known input set | Final score matches the weighted formula and live preview updates |
| FT-12 | Result generation | Submit the final training page | Result page renders and locks edits |
| FT-13 | Result content | Inspect the final screen | Score, track, duration, tool guidance, and module list are visible |
| FT-14 | Result lock | Try to edit the wizard after submit | Result remains read-only and no answer changes are accepted |
| FT-15 | Retake flow | Click Retake assessment | App resets to a clean intro state with no prior answers |
| FT-16 | Supabase save success | Submit a completed assessment on a valid HTTP origin | Sync message transitions from saving to saved |
| FT-17 | Supabase retry | Break the config or network and submit again | Sync error appears and retry action is available |
| FT-18 | Mobile layout | Open the app at 390 x 844 | Layout remains usable, readable, and vertically scrollable |
| FT-19 | Keyboard navigation | Move through the flow with keyboard only | Buttons and form controls remain reachable and usable |
| FT-20 | Reload behavior | Refresh the page mid-flow | App returns to a clean initial state |

## Expected Reference Result

Use this sample combination as the primary regression check:

- Paid tool: ChatGPT
- Current tools: ChatGPT and Claude
- Weekly time: 3-6 hours
- Goal: Build a product/side project
- Ratings: 4, 4, 3, 4, 3, 4
- Training: Yes, with a course name entered

Expected output:

- AI fluency score: 70/100
- Track: Builder Track
- Duration: 7 weeks at 4 hrs/week
- Sync status: saved to Supabase after submission

## Non-Functional Checks

- The app should feel responsive after each input change.
- The live preview should stay in sync with the current answers.
- The result page should not allow post-submit editing.
- The page should remain readable on small screens without horizontal scrolling.
- The app should still be usable if external fonts fail to load.

## Failure Handling

- Capture a screenshot of the failing state.
- Record the step, browser, viewport, and local URL used.
- Note any console errors or sync errors verbatim.
- Re-run the failing case once after a page reload before opening a bug.

## Suggested Execution Order

1. Smoke test
2. Functional flow tests
3. Result and sync tests
4. Responsive and keyboard checks
5. Negative-path checks

