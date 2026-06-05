# Testing Plan

## Overview
This defines the end-to-end verification strategy for LinguaLayer, comprising unit testing, end-to-end Playwright tests, K6 load tests, and security tests through Firebase Emulators.

## Performance
We use k6 performance scenarios (placed in the \`/performance\` directory):
- **Smoke**: Baseline minimal capability.
- **Normal Load**: 50 concurrent.
- **Stress**: Ramping to 200 concurrent users.
- **Spike**: Fast surge to 200 within 10s.
- **Soak**: Long duration stable usage.

## End-to-End
Playwright tests reside in \`/e2e/\` and test vital business flows (owner initiation, participant joining, message routing across profiles). They simulate cross-browser behavior (Chromium, Firefox, WebKit, Mobile emulations).

## Acceptance Criteria
- Live Chat remains responsive under 50 CCU.
- API maintains < 800ms median TTFB for language translations (excluding LLM cold-starts).
- Failed predictions degrade gracefully to raw message text with "Pending/Review" statuses.
- No cross-tenant access allowed across Firebase session docs.
