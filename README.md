# Trellis Digital Bank

A professional, role-based digital banking simulation built with Next.js App Router and TypeScript.

## PostgreSQL and Prisma

The application uses PostgreSQL with Prisma ORM.

```bash
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Set `DATABASE_URL` to a PostgreSQL connection string and `AUTH_SECRET` to a strong random secret.

## Features

- Admin, Bank Staff, and Customer workspaces
- Customer accounts, balances, transfers, transactions, loans, and statements
- Staff customer operations and pending review workflows
- Admin customer, account, and loan management views
- Redux Toolkit slices for authentication, accounts, transactions, and loans
- Recharts financial activity and cash-flow visualizations
- Sonner toast notifications for success and error feedback
- Persistent light and dark themes inspired by the dashboard palette in `src/assets/dashboard.png`
- Responsive desktop, tablet, and mobile UI
- Server-side transfer validation and route authorization

## Demo Credentials

Choose a role on the sign-in screen:

| Role | Email | Password |
|---|---|---|
| Admin | admin@trellis.bank | 11223344 |
| Bank Staff | baru@mailinator.com | 112233mm |
| Customer | jamie@trellis.bank | 112233mm |

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Architecture

- Redux store: `src/store/store.ts`
- Redux provider and typed hooks: `src/store/`
- Application pages: `src/app/`
- Server authentication route: `src/app/api/auth/login/route.ts`
- Secure transfer API: `src/app/api/banking/transfer/route.ts`
- Dashboard route guard: `src/middleware.ts`

## Transaction Processing

The transfer API validates role, 4-digit PIN format, positive server-side amount, recipient existence, and sufficient sender balance. Sender and recipient balances are updated together in one server operation, and a unique transaction reference is returned. This assessment demo uses in-memory account data; production deployments should use PostgreSQL or another transactional database.

## Environment Variables

No environment variables are required for the demo. Production deployment may add `DATABASE_URL`, `AUTH_SECRET`, and payment-provider credentials as integrations are added.
