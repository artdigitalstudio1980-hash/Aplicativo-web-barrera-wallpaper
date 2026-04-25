
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL before creating Prisma Client
if (!process.env.DATABASE_URL) {
  console.error('========================================');
  console.error('❌ CRITICAL ERROR: DATABASE_URL is missing!');
  console.error('========================================');
  console.error('Current environment variables:');
  console.error('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  console.error('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
  console.error('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET');
  console.error('========================================');
  console.error('Please add DATABASE_URL in Hostinger Setup Node.js App');
  console.error('Format: postgresql://user:pass@host:6543/postgres');
  console.error('========================================');
  throw new Error('DATABASE_URL is required but not configured');
}

console.log('✅ DATABASE_URL is configured');
console.log('✅ Attempting to connect to database...');

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
