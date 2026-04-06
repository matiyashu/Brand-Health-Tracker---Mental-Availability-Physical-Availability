import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const clerkEnabled =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY

export async function middleware(req: NextRequest) {
  if (!clerkEnabled) return NextResponse.next()

  // Clerk v4 API
  const { authMiddleware } = await import('@clerk/nextjs/server')

  const mw = authMiddleware({
    publicRoutes: [
      '/',
      '/sign-in(.*)',
      '/sign-up(.*)',
      '/api/trpc(.*)',
      '/api/analytics(.*)',
    ],
  })

  // @ts-expect-error — authMiddleware returns a Next.js middleware compatible handler
  return mw(req, { waitUntil: () => {} })
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
}
