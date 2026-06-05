# Pilot Integration Guide

## Accessing the Pilot
The Pilot uses an embedded "SDK-Ready" framework, isolating two distinct workflows hidden from the mainstream LinguaLayer platform menu:

- **Customer Widget**: Navigate forcefully to \`/#/pilot/customer\`
- **Agent Dashboard**: Navigate forcefully to \`/#/pilot/agent\`

## Execution Flow
1. Open the Agent Dashboard, authenticate as the operator, and specify your working language (e.g. English).
2. Create a "New Ticket" and copy the resulting internal string.
3. As the Customer (in another browser or device), visit the Customer Widget, pick an opposing language (e.g., Spanish), and paste the ticket ID.
4. Messages traverse seamlessly through the \`LinguaLayer Core\`, demonstrating translation fidelity matching native live chat without rebuilding the logic pipelines.

This effectively validates that an OEM Enterprise or standalone third party could "drop in" the Core directly into specialized CRM web platforms.
