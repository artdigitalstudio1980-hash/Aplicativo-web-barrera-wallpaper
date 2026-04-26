import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy validation to avoid build-time crashes
const getPrismaClient = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  DATABASE_URL is missing in production environment!');
    } else {
      console.warn('ℹ️  DATABASE_URL not found. Database features will be unavailable.');
    }
  } else {
    console.log('✅ DATABASE_URL is configured');
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
