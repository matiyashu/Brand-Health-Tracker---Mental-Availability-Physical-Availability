import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { TRPCProvider } from '@/lib/trpc/client'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Fortuna — Brand Health Tracker',
  description:
    'CBM-compliant brand health tracking — Mental Availability, Physical Availability, Double Jeopardy normalization.',
}

const clerkEnabled =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Conditionally wrap with ClerkProvider only when keys are configured
  if (clerkEnabled) {
    const { ClerkProvider } = await import('@clerk/nextjs')
    return (
      <ClerkProvider>
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
          <body className="font-sans antialiased">
            <TRPCProvider>{children}</TRPCProvider>
          </body>
        </html>
      </ClerkProvider>
    )
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
