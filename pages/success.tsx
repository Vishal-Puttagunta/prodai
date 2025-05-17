import { useEffect } from "react"
import { useRouter } from "next/router"

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const sessionId = router.query.session_id

    if (sessionId) {
      // Optionally: ping your backend or show confirmation
      console.log("Stripe session completed:", sessionId)
    }
  }, [router.query])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-600">✅ Subscription Successful</h1>
        <p className="text-gray-600 mb-6">
          Your team plan is now active. You can now create and manage your organization.
        </p>
        <a
          href="/team-overview"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
        >
          Go to Team Dashboard
        </a>
      </div>
    </div>
  )
}
