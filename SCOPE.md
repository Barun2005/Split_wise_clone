# Project Scope

## In Scope

### 1. User Accounts and Authentication
- Email/Password registration and login.
- JWT-based authentication using http-only cookies.

### 2. Group Management
- Create, read, update, and delete groups.
- Manage group memberships with strict `joinDate` and `leaveDate` timelines.

### 3. Expense Tracking
- Add, edit, and delete expenses within groups.
- Support various split methods:
  - **Equal Split**: Evenly distributed among all or selected participants.
  - **Percentage Split**: Split based on specific percentages (must total 100%).
  - **Exact Amount Split**: Split based on exact monetary values.
  - **Unequal Split**: General unequal distribution handled as exact amounts under the hood.
- Expenses are validated against member timelines (cannot add a member to an expense if the date is outside their join/leave window).

### 4. Multi-currency Support
- Support for `INR` and `USD`.
- Store the original currency, a base currency equivalent, and the exchange rate used.
- Conversion occurs gracefully, prioritizing deterministic calculations.

### 5. Settlement Engine
- Mathematically correct engine to calculate net group balances.
- Debt simplification algorithm to minimize the number of required reimbursement transactions between members.
- Detailed step-by-step breakdown of how balances are derived from specific expenses.

### 6. CSV Import Pipeline
- Robust CSV parser capable of reading multi-row expense sheets.
- Validation and anomaly detection returning actionable `ImportIssue`s.
- Interactive review UI for users to approve suggested fixes before the database is populated.

### 7. Audit Logging
- System tracks any updates to expenses or group memberships, creating an immutable trail of changes.

## Out of Scope
- OAuth/Social Logins (Google, Facebook, etc.).
- Real-time WebSockets/Push Notifications.
- Payment Gateway Integrations (Stripe, Razorpay).
- Offline Mode / PWA support.
