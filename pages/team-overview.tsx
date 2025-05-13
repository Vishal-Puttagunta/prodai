import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TeamOverview() {
  const { user } = useUser()
  const [teams, setTeams] = useState<any[]>([])
  const [members, setMembers] = useState<Record<string, any[]>>({})
  const [tasks, setTasks] = useState<Record<string, any[]>>({})

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      // Step 1: Get manager's teams
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('manager_id', user.id)

      if (teamError || !teamData) return console.error(teamError)

      setTeams(teamData)

      // Step 2: For each team, get members and tasks
      const allMembers: Record<string, any[]> = {}
      const allTasks: Record<string, any[]> = {}

      for (const team of teamData) {
        const { data: memberData } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.id)

        const enrichedMembers = await Promise.all(
          (memberData || []).map(async (m) => {
            const res = await fetch(`/api/clerk-user?userId=${m.user_id}`)
            const user = await res.json()
            return {
              user_id: m.user_id,
              name: user.name,
              email: user.email,
            }
          })
        )
        
        allMembers[team.id] = enrichedMembers

        for (const member of memberData || []) {
          const { data: taskData } = await supabase
            .from('tasks')
            .select('*')
            .eq('assigned_to', member.user_id)

          if (!allTasks[team.id]) allTasks[team.id] = []
          allTasks[team.id].push(...(taskData || []))
        }
      }

      setMembers(allMembers)
      setTasks(allTasks)
    }

    fetchData()
  }, [user])

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <main className="p-6 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Team Overview</h1>

          {teams.length === 0 ? (
            <p>You have no teams yet.</p>
          ) : (
            teams.map((team) => (
              <div key={team.id} className="mb-8 border rounded p-4">
                <h2 className="text-2xl font-semibold mb-4">{team.name}</h2>

                {(members[team.id] || []).map((member) => {
                  const memberTasks = (tasks[team.id] || []).filter(
                    (task) => task.assigned_to === member.user_id
                  )

                  return (
                    <div key={member.user_id} className="mb-4 pl-4 border-l-2 border-gray-300">
                      <h3 className="text-lg font-medium mb-1">
                        {member.name} ({member.email})
                      </h3>

                      {memberTasks.length === 0 ? (
                        <p className="text-sm text-gray-500 mb-2">No tasks assigned.</p>
                      ) : (
                        <ul className="list-disc list-inside text-sm">
                          {memberTasks.map((task) => (
                            <li key={task.id}>
                              {task.title} — <span className="text-gray-500">{task.status}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </main>
      </SignedIn>
    </>
  )
}
