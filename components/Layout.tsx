// components/Layout.tsx
import Link from 'next/link'
import { SignedIn, SignedOut, SignOutButton, UserButton } from '@clerk/nextjs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-blue-600">Productivity AI</Link>
          <SignedIn>
            <nav className="space-x-4 hidden sm:flex">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/log">Log</Link>
              <Link href="/create-task">Assign Task</Link>
              <Link href="/create-team">Create Team</Link>
              <Link href="/team-overview">Team Overview</Link>
              <SignOutButton>
                <button className="ml-2 text-red-600">Sign out</button>
              </SignOutButton>
            </nav>
            <UserButton afterSignOutUrl="/sign-in" />
          </SignedIn>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
