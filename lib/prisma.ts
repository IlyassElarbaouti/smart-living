import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  // Add configuration for better serverless compatibility
  ...(process.env.NODE_ENV === 'production' && {
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Ensure connection is established
if (process.env.NODE_ENV === 'production') {
  prisma.$connect().catch((error) => {
    console.error('Failed to connect to database:', error);
  });
}
