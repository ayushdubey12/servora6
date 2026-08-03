# SERVORA Backend MVP

This backend scaffold provides a starting point for the SERVORA MVP using Express, TypeScript, Zod, and Socket.IO.

## Quick start

1. Install dependencies in the backend folder:
   - npm install
2. Copy .env.example to .env and update values.
3. Run the server:
   - npm run dev

## Available endpoints

- GET /health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/restaurant
- GET /api/categories
- GET /api/menu-items
- GET /api/tables
- POST /api/orders
- GET /api/orders
- POST /api/payments/create
