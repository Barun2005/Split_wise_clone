# Architectural Decisions Log

This document records the major architectural decisions made during the development of the Shared Expenses application.

## 1. Framework Selection
**Decision:** Next.js 15 (App Router)
**Rationale:** Next.js provides a unified full-stack environment. The App Router enables React Server Components, reducing the client-side bundle size, improving performance, and simplifying data fetching directly from the database where appropriate.

## 2. Database and ORM
**Decision:** PostgreSQL + Prisma
**Rationale:** The application requires complex relational data (Groups, Members, Expenses, Participants, Audit Logs). PostgreSQL provides robust relational integrity and JSON capabilities. Prisma offers an excellent type-safe interface, reducing runtime errors and improving developer velocity.

## 3. Authentication
**Decision:** Custom JWT via HTTP-Only Cookies
**Rationale:** The requirements specified "JWT Authentication". Using a custom JWT implementation with HTTP-only cookies guarantees statelessness while mitigating Cross-Site Scripting (XSS) risks compared to storing tokens in `localStorage`. Next.js Middleware easily handles cookie validation on every request.

## 4. UI Library
**Decision:** Tailwind CSS + shadcn/ui
**Rationale:** Tailwind enables rapid, utility-first styling. shadcn/ui provides highly accessible, copy-pasteable Radix UI components that allow for complete stylistic control, which is necessary for a premium, dynamic design.

## 5. Debt Simplification Algorithm
**Decision:** Greedy Algorithm / Min-Max Heap
**Rationale:** We represent the net balances of all users in a group. The algorithm matches the maximum debtor with the maximum creditor iteratively until all balances are resolved. This is deterministic, mathematically correct, and runs in $O(N \log N)$ time, suitable for groups of any realistic size.

## 6. CSV Import Pipeline
**Decision:** Asynchronous / Two-step process
**Rationale:** Instead of silently inserting or discarding rows, the system creates an `ImportSession`. It parses and validates the CSV, creating `ImportIssue` records for any anomalies (e.g., date mismatches with membership timeline, missing fields). The user must review these in a dedicated UI before committing the data, preventing database corruption.
