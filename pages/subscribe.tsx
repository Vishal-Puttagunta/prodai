"use client"

import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { CheckCircle, CreditCard, Loader2 } from "lucide-react"

export default function SubscribePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return

    setLoading(true)

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.primaryEmailAddress.emailAddress,
        userId: user.id,
      }),
    })

    const data = await res.json()
    if (data?.url) {
      window.location.href = data.url
    } else {
      alert("Something went wrong.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-md border border-slate-200 rounded-xl shadow-lg bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 text-center space-y-1">
          <div className="flex justify-center mb-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Team Plan</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Lavure Team Subscription</h1>
          <p className="text-slate-500 text-sm">Unlock premium features for your entire team</p>
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-2">
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
            <div className="flex justify-center mb-2">
              <span className="text-3xl font-bold text-slate-800">$10</span>
              <span className="text-slate-500 self-end mb-1 ml-1">/month</span>
            </div>

            <ul className="space-y-2 mt-4">
              {["Unlimited Team Creation", "Real-Time Task Updates", "Advanced AI Reports", "Simple Task Management"].map(
                (feature) => (
                  <li key={feature} className="flex items-center text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex flex-col gap-4">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Subscribe Now
              </>
            )}
          </button>
          <p className="text-xs text-center text-slate-500">
            Secure payment processing. Cancel anytime with no questions asked.
          </p>
        </div>
      </div>
    </div>
  )
}
