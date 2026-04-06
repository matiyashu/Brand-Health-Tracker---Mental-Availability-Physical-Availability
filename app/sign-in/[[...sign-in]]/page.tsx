import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-neon-green flex items-center justify-center">
            <span className="text-white font-black text-sm">F</span>
          </div>
          <span className="text-gray-900 font-bold text-lg">Fortuna</span>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-md border border-gray-200',
              headerTitle: 'text-gray-900',
              formButtonPrimary: 'bg-neon-green hover:bg-neon-green/90',
            },
          }}
        />
      </div>
    </div>
  )
}
