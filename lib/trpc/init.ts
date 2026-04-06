import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { prisma, dbAvailable } from '@/lib/db'

/**
 * tRPC context — available in every procedure.
 * userId is null in demo mode (no Clerk keys configured).
 */
export async function createTRPCContext(opts: { headers: Headers }) {
  let userId: string | null = null

  // Only attempt Clerk auth if keys are configured
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    try {
      const { auth } = await import('@clerk/nextjs')
      const session = auth()
      userId = (session as { userId?: string }).userId ?? null
    } catch {
      // Clerk not configured — run in demo mode
    }
  }

  return {
    prisma,
    dbAvailable,
    userId,
    headers: opts.headers,
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const middleware = t.middleware

/** Public procedure — no auth required */
export const publicProcedure = t.procedure

/** Protected procedure — requires Clerk userId */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  // In demo mode (no Clerk keys) allow through with a demo userId
  const userId = ctx.userId ?? (process.env.NODE_ENV === 'development' ? 'demo-user' : null)
  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Sign in to continue' })
  }
  return next({ ctx: { ...ctx, userId } })
})

/** DB-required procedure — requires DATABASE_URL */
export const dbProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.dbAvailable) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'DATABASE_URL is not configured. Running in demo mode.',
    })
  }
  return next({ ctx })
})
