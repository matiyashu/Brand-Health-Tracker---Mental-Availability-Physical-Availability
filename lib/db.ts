import { PrismaClient } from '@prisma/client'

// Prevent multiple Prisma Client instances in development (hot reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/** Returns true if DATABASE_URL is configured — used for graceful fallback to demo data */
export const dbAvailable = !!process.env.DATABASE_URL
