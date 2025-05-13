import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Log() {
  const [entry, setEntry] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || entry.trim() === '') return

    setLoading(true)

    const { error } = await supabase.from('logs').insert({
      user_id: user.id,
      content: entry
    })

    setLoading(false)

    if (error) {
      console.error('Error submitting log:', error)
      alert('There was an error submitting your log.')
    } else {
      setSubmitted(true)
      setEntry('')
    }
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <main className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Daily Log</h1>

          {submitted ? (
            <p className="text-green-600">✅ Log submitted!</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full p-3 border rounded-md"
                rows={5}
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="What did you work on today?"
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}
        </main>
      </SignedIn>
    </>
  )
}
