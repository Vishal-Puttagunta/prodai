"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, Home, ClipboardList, BarChart3, ChevronRight, LayoutDashboard } from "lucide-react"
import { SignedIn, SignedOut, SignOutButton, UserButton, useUser, useOrganization } from "@clerk/nextjs"

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useUser()
  const { organization } = useOrganization()
  const pathname = usePathname()

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Assign Task", href: "/create-task", icon: ClipboardList },
    { name: "Reports", href: "/team-overview", icon: BarChart3 },
  ]

  useEffect(() => {
    const checkRole = async () => {
      if (!user?.id || !organization?.id) return

      try {
        const res = await fetch(`/api/get-user-role?userId=${user.id}&orgId=${organization.id}`)
        const data = await res.json()
        console.log("Clerk Role Response:", data)

        if (data.role?.includes("admin")) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (err) {
        console.error("Failed to fetch role:", err)
      }
    }

    checkRole()
  }, [user, organization])

  const filteredLinks = links.filter((link) => {
    if (["Assign Task", "Manage Team"].includes(link.name)) {
      return isAdmin
    }
    return true
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center text-xl font-bold tracking-tight transition-transform hover:scale-105"
        >
          <Image src="/lavure.png" alt="Lavure AI Logo" width={32} height={32} className="mr-2" priority />
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Lavure
          </span>
        </Link>

        <nav className="hidden md:flex gap-1 items-center">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href
            const LinkIcon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50"
                  }
                `}
              >
                <LinkIcon
                  className={`mr-1.5 h-4 w-4 ${isActive ? "text-purple-500" : "text-gray-500 dark:text-gray-400"}`}
                />
                {link.name}
              </Link>
            )
          })}

          <div className="h-6 mx-2 border-l border-gray-200 dark:border-gray-700"></div>

          <SignedOut>
            <Link
              href="/sign-in"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="ml-1 px-3 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Sign Up
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 border-2 border-purple-100",
                },
              }}
            />
          </SignedIn>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-1 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 animate-in slide-in-from-top duration-200">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href
            const LinkIcon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center justify-between rounded-md px-4 py-2.5 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50"
                  }
                `}
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center">
                  <LinkIcon
                    className={`mr-2 h-4 w-4 ${isActive ? "text-purple-500" : "text-gray-500 dark:text-gray-400"}`}
                  />
                  {link.name}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            )
          })}

          <div className="my-2 border-t border-gray-200 dark:border-gray-800"></div>

          <SignedOut>
            <Link
              href="/sign-in"
              className="flex items-center justify-between rounded-md px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <span>Sign In</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center justify-between rounded-md px-4 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-900/20 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <span>Sign Up</span>
              <ChevronRight className="h-4 w-4 text-purple-500" />
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="px-4 py-2.5">
              <SignOutButton>
                <button className="w-full text-left text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>
      )}
    </header>
  )
}
