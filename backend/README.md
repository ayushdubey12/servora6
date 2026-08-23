# SERVORA Backend

Express + TypeScript + Prisma + PostgreSQL backend for the SERVORA restaurant platform.

## Quick start (local development)

Requires a running PostgreSQL instance.

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and update values:
   ```
   cp .env.example .env
   ```

3. Run the dev server:
   ```
   npm run dev
   ```

The server auto-seeds demo data (Hotel Siraj) if the database is empty.

## Production build

```
npm run build        # prisma generate + tsc
npm run migration    # prisma migrate deploy
npm start            # node dist/server.js
```

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/servora` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | Secret for JWT signing (when implemented) | (required in production) |
| `JWT_EXPIRES_IN` | JWT token expiry | `7d` |
| `CORS_ORIGIN` | Comma-separated allowed origins | `https://your-frontend.up.railway.app` |

## Available endpoints

- `GET /health` — Health check
- `POST /api/auth/register` — Register owner account
- `POST /api/auth/login` — Owner login
- `POST /api/customer/register` — Register customer
- `POST /api/customer/login` — Customer login
- `GET /api/restaurant` — Get restaurant details
- `GET /api/categories` — List categories
- `POST /api/categories` — Create category
- `GET /api/menu-items` — List menu items
- `POST /api/menu-items` — Create menu item
- `GET /api/tables` — List tables
- `POST /api/orders` — Create order
- `GET /api/orders` — List orders
- `POST /api/payments/create` — Process payment
- `GET /api/reservations` — List reservations
- `POST /api/reservations` — Create reservation
- `GET /api/waiters` — List staff
- `GET /api/stats/waiters` — Staff performance stats

## Railway deployment

Backend service requires:

- **Root Directory:** `/backend`
- **Build Command:** `npm install` (postinstall generates Prisma client, build compiles TypeScript)
- **Pre-Deploy Command:** `npx prisma migrate deploy`
- **Start Command:** `npm start`

Set these environment variables in Railway:

```
DATABASE_URL=<from Railway PostgreSQL plugin>
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate a strong random secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.up.railway.app
```

## Database

This project uses **PostgreSQL** via Prisma ORM.

### Migrations

```
# Apply pending migrations in production
npx prisma migrate deploy

# Create a new migration during development
npx prisma migrate dev --name description
```

### Seeding

Demo data (Hotel Siraj restaurant, menu, tables, staff) is seeded automatically on first run if the database is empty. No manual seeding is required for production.
