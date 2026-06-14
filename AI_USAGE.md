# AI Usage Documentation

This document summarizes how AI tools were used to build the Shared Expenses App, adhering to the requirement for an `interview-friendly` codebase.

## 1. Architectural Planning
- Initial project scaffolding and architecture were designed by an AI agent acting as a Senior Product Manager and Architect.
- Complex requirements such as multi-currency handling and group membership timelines were analyzed, and appropriate Prisma schemas were generated.

## 2. Debt Simplification Algorithm
- AI assisted in designing a mathematically correct greedy algorithm for calculating the minimum number of transactions needed to settle all balances within a group.
- Unit tests validating the mathematical accuracy of the engine were generated with AI assistance.

## 3. Anomaly Detection Engine
- The rules for detecting anomalies in CSV imports (duplicate expenses, missing fields, timeline mismatches) were defined and translated into TypeScript validators using AI.
- AI was used to ensure all edge cases were covered with actionable `ImportIssue` resolutions.

## 4. UI/UX Generation
- The aesthetic design, incorporating Tailwind CSS and shadcn/ui, was generated to provide a premium, modern user experience.
- Accessible components and micro-animations were added to meet modern web standards.

## Code Quality
- Throughout the project, every major function was documented with its `purpose`, `assumptions`, and `edge cases` as required by the initial specifications.
- Clean architecture principles were enforced by separating API route handlers, database interaction logic, and UI components.
