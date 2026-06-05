# Controlled External SDK Pilot Guide

## Introduction
This guide outlines the protocol for executing the initial external pilot of the LinguaLayer SDK. The goal is to collect real-world viability metrics without exposing the primary product to unverified load or uncontrolled risk.

## Pilot Scope
- **Testers**: 5 to 10 verified participants (internal team members or trusted beta clients).
- **Target Volume**: 20+ complete conversations yielding at least 200+ total messages.
- **Duration**: 2 to 3 days.
- **Platform Matrix**: Minimum of 2 unique mobile devices (e.g., iPhone Safari, Pixel Chrome) and 2 unique desktop environments (e.g., Windows Edge, macOS Chrome).
- **Languages Required**: Test concurrently across at least 4 primary language families (e.g., English, Spanish, Mandarin Chinese, and Swahili or French).

## Exact Customer-Agent Flow
1. **Agent Setup**: The designated "Agent" opens `/#/pilot/agent`, selects their native language (e.g., English), authenticates via Google, and creates a support ticket.
2. **Distribution**: The generated Ticket ID is shared out-of-band with the "Customer".
3. **Customer Entry**: The "Customer" opens `/#/pilot/customer`, enters the Ticket ID, selects their native language (e.g., Spanish or Mandarin), and initiates contact.
4. **Dialogue Execution**: The two endpoints communicate normally. The LinguaLayer Delivery Engine silently intercepts and standardizes the language translations in transit.
5. **Resolution**: The Agent finalizes the request and formally closes the session.

## Critical Messages to Test
Testers must inject these exact phrases into live interactions to verify NLP fidelity:
1. “Can we trade 300 units next month?”
2. “Please do not deliver the package before Friday.”
3. “The total price is £2,450.”
4. “Can David Maina meet us at 10:30 AM?”
5. “The delivery address is 24 King Street.”
6. “I might order 50 additional units.”
7. “Is order AB-300 ready?”
8. “Do not cancel the shipment.”

## Execution Metrics & Collection
Throughout the duration of the pilot, track the following key performance indicators (KPIs) via external spreadsheets or direct user feedback forms:

- **Accuracy Metrics**: 
  - Meaning drift (did the context change?)
  - Preserved nouns (names, dates, prices, numbers)
  - Tone preservation (did negation stay negative, questions stay questioning?)
- **System Metrics**:
  - Wrong-language messages delivered
  - Lost messages (sent but never arrived)
  - Duplicate messages received
  - Response speed (time to delivery on screen)
- **Subjective Metrics**:
  - User satisfaction score
  - Necessity of external/manual translation corrections

## Recording Failures
If you encounter failures:
- Copy the exact original text and the incorrectly translated target text.
- Note the source language and target language.
- Enter these details into the "Manual Test Notes" section of the Pilot Validation Centre (`/#/pilot/validation`), including device and browser data.

## Halting Requirements (When to stop)
Immediately halt the pilot if any of the following occur:
- A "Lost Message" or "Dropped Payload" is detected.
- Cross-tenant cross-contamination occurs (messages intended for one room appear in another).
- A hard security crash or exposure of underlying prompt/API keys occurs.
- The external backend begins returning consistent `500 Server Error` or rate-limiting traps.

## Success Criteria
The pilot is considered a success when the target volume (200+ messages) is hit with:
1. Zero cross-tenant security breaches.
2. Zero lost messages.
3. 95%+ strict fidelity on preserved numbers, prices, and entity names.
4. Correct translations routing smoothly 100% of the time, validating that the underlying infrastructure is robust enough to support an Android or OEM SDK release.
