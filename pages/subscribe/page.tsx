"use client"

import { useUser } from "@clerk/nextjs"
import { useState } from "react"

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
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Start Your Lavure Workspace</h1>
        <p className="text-gray-600 mb-6">Subscribe for $10/month. Cancel anytime.</p>
        <button
          onClick={handleSubscribe}
          className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
          disabled={loading}
        >
          {loading ? "Redirecting..." : "Subscribe Now"}
        </button>
      </div>
    </div>
  )
}
