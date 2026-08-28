import { prisma } from './src/lib/prisma.js';

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
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
      )
    `);
    console.log('Created Subscription table');
  } catch (e: any) {
    console.log('Subscription table:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Revenue" (
        "id" TEXT NOT NULL,
        "restaurantId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "type" TEXT NOT NULL,
        "description" TEXT,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('Created Revenue table');
  } catch (e: any) {
    console.log('Revenue table:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_restaurantId_fkey"
      FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
    console.log('Added Subscription FK');
  } catch (e: any) {
    console.log('Subscription FK:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_restaurantId_fkey"
      FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
    console.log('Added Revenue FK');
  } catch (e: any) {
    console.log('Revenue FK:', e.message);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
