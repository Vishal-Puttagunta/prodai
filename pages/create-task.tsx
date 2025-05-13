import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function CreateTask() {
  const { user } = useUser()
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !assignee.trim()) {
      setError('Both fields are required.')
      return
    }

    const { error: insertError } = await supabase.from('tasks').insert({
      title,
      assigned_to: assignee,
      status: 'pending'
    })

    if (insertError) {
      console.error('Error creating task:', insertError)
      setError('Error creating task.')
    } else {
      setSubmitted(true)
      setTitle('')
      setAssignee('')
    }
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <main className="p-6 max-w-xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Assign a New Task</h1>

          {submitted && (
            <p className="text-green-600 mb-3">✅ Task created successfully!</p>
          )}

          {error && <p className="text-red-600 mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., Email client"
              />
            </div>

            <div>
              <label className="block font-medium">Assignee (Clerk User ID)</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., user_abc123..."
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Create Task
            </button>
          </form>
        </main>
      </SignedIn>
    </>
  )
}
