import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function CreateTask() {
    const { user } = useUser()
    const [title, setTitle] = useState('')
    const [teamId, setTeamId] = useState('')
    const [assigneeId, setAssigneeId] = useState('')
    const [teams, setTeams] = useState<any[]>([])
    const [members, setMembers] = useState<any[]>([])
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
  
    // Fetch manager's teams
    useEffect(() => {
      const fetchTeams = async () => {
        const { data, error } = await supabase
          .from('teams')
          .select('id, name')
          .eq('manager_id', user?.id)
  
        if (!error && data) setTeams(data)
      }
  
      if (user?.id) fetchTeams()
    }, [user])
  
    // Fetch members of selected team
    useEffect(() => {
      const fetchMembers = async () => {
        if (!teamId) return
  
        const { data, error } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', teamId)
  
        if (!error && data) setMembers(data)
      }
  
      fetchMembers()
    }, [teamId])
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
  
      if (!title || !assigneeId || !teamId) {
        setError('All fields are required.')
        return
      }
  
      const { error: insertError } = await supabase.from('tasks').insert({
        title,
        assigned_to: assigneeId,
        team_id: teamId,
        status: 'pending'
      })
  
      if (insertError) {
        console.error('Task creation error:', insertError)
        setError('Failed to create task.')
      } else {
        setTitle('')
        setTeamId('')
        setAssigneeId('')
        setSuccess(true)
      }
    }
  
    return (
      <>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
  
        <SignedIn>
          <main className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Assign a Task</h1>
  
            {success && <p className="text-green-600">✅ Task created successfully!</p>}
            {error && <p className="text-red-600">{error}</p>}
  
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
  
              <div>
                <label className="block font-medium">Select Team</label>
                <select
                  value={teamId}
                  onChange={(e) => {
                    setTeamId(e.target.value)
                    setAssigneeId('') // Reset assignee when team changes
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Select Team --</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
  
              <div>
                <label className="block font-medium">Assign To</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={!members.length}
                >
                  <option value="">-- Select Member --</option>
                  {members.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.user_id}
                    </option>
                  ))}
                </select>
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
  