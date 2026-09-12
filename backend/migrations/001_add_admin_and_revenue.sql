-- Migration: Add admin role, Subscription and Revenue tables
-- Run this against the production database if prisma db push fails

-- 1. Create Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "plan" TEXT NOT NULL DEFAULT 'basic',
  "setupFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "annualFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'active',
  "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "nextBillingDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- 2. Create Revenue table
CREATE TABLE IF NOT EXISTS "Revenue" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- 3. Add foreign keys
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_restaurantId_fkey"
  FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_restaurantId_fkey"
  FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Seed admin user (password: admin123 — will be rotated on startup)
-- Only insert if no admin exists yet
INSERT INTO "User" ("id", "name", "email", "password", "role", "restaurantId", "createdAt", "updatedAt")
SELECT
  'admin_' || substr(md5(random()::text), 1, 20),
  'Servora Admin',
  'admin@servora.in',
  '$2a$10$YQ8GvzFfGz9eFh6k1fJx8eFh6k1fJx8eFh6k1fJx8eFh6k1fJx8e',
  'admin',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE "email" = 'admin@servora.in');
