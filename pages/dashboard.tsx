// pages/dashboard.tsx
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'

const fakeTasks = [
  { title: 'Email client', status: 'pending' },
  { title: 'Write weekly update', status: 'done' }
]

export default function Dashboard() {
    const { user } = useUser()
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
  
    useEffect(() => {
      const fetchTasks = async () => {
        if (!user?.id) return
  
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', user.id)
  
        if (error) {
          console.error('Error fetching tasks:', error)
        } else {
          setTasks(data || [])
        }
  
        setLoading(false)
      }
  
      fetchTasks()
    }, [user])
  
    return (
      <>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
  
        <SignedIn>
          <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              Welcome, {user?.firstName}!
            </h1>
  
            <h2 className="text-xl font-semibold mb-2">Your Tasks</h2>
  
            {loading ? (
              <p>Loading...</p>
            ) : tasks.length === 0 ? (
              <p>No tasks assigned to you.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className="border p-3 rounded-md">
                    <span className="font-medium">{task.title}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({task.status})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </main>
        </SignedIn>
      </>
    )
  }
  