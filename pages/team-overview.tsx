"use client"

import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useOrganization,
  useUser,
  OrganizationSwitcher
} from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabaseClient"
import {
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Loader2,
  Users,
  User,
  FileText,
  Briefcase,
  Download
} from "lucide-react"

type Member = {
  id: string
  user_id: string
  name: string
  email: string
}

export default function TeamOverview() {
  const { organization } = useOrganization()
  const { user } = useUser()
  const router = useRouter()

  const [members, setMembers] = useState<Member[]>([])
  const [tasks, setTasks] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [accessChecked, setAccessChecked] = useState(false)

  // ✅ Updated: Check if user has access (subscribed or in org)
  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) return
  
      try {
        const res = await fetch("/api/check-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        })
  
        const result = await res.json()
        if (!result.ok) {
          router.push("/subscribe")
        } else {
          setAccessChecked(true)
        }
      } catch (err) {
        console.error("Failed to verify subscription:", err)
      }
    }
  
    checkAccess()
  }, [user, organization, router])
  

  // Load organization members and their tasks
  useEffect(() => {
    const fetchData = async () => {
      if (!organization?.id) return

      try {
        const res = await fetch(`/api/get-org-members?orgId=${organization.id}`)
        const data = await res.json()
        setMembers(data)

        const taskMap: Record<string, any[]> = {}
        for (const member of data) {
          const { data: userTasks, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("assigned_to", member.id)
            .eq("team_id", organization.id)
          if (error) console.warn("Task fetch error:", error)
          taskMap[member.id] = userTasks || []
        }

        setTasks(taskMap)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching org members or tasks:", err)
        setLoading(false)
      }
    }

    fetchData()
  }, [organization])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "finished": return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "pending": return <Clock className="h-4 w-4 text-amber-500" />
      case "cancel": return <XCircle className="h-4 w-4 text-rose-500" />
      case "roll": return <RefreshCw className="h-4 w-4 text-sky-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200"
      case "cancel": return "bg-rose-100 text-rose-800 border-rose-200"
      case "roll": return "bg-sky-100 text-sky-800 border-sky-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const downloadReport = async () => {
    const res = await fetch("https://lavure-ai-backend.onrender.com/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_id: organization?.id })
    })

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "team-productivity-report.pdf"
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  if (!accessChecked) return null

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-800">{organization?.name}</span>
                  </div>
                  <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/team-overview" />
                  <button
                    onClick={downloadReport}
                    className="flex items-center bg-purple-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-purple-700 transition"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Generate AI Report
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-1 bg-purple-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">Team Members</h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <Users className="h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No team members</h3>
                  <p className="mt-1 text-gray-500">There are no members in this organization yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {members.map((member) => {
                    const memberTasks = tasks[member.id] || []
                    const tasksByStatus = {
                      finished: memberTasks.filter((task) => task.status === "finished").length,
                      pending: memberTasks.filter((task) => task.status === "pending").length,
                      roll: memberTasks.filter((task) => task.status === "roll").length,
                      cancel: memberTasks.filter((task) => task.status === "cancel").length,
                    }

                    return (
                      <div
                        key={member.user_id}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="p-4 border-t-4 border-t-purple-500">
                          <div className="flex items-start space-x-3">
                            <div className="bg-purple-100 rounded-full p-2 mt-1">
                              <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-800">{member.name}</h3>
                              <p className="text-sm text-gray-500">{member.email}</p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {memberTasks.length > 0 ? (
                                  <>
                                    <div className="flex items-center text-xs px-2 py-1 rounded-full bg-gray-100">
                                      <Briefcase className="h-3 w-3 mr-1 text-gray-500" />
                                      <span>{memberTasks.length} tasks</span>
                                    </div>

                                    {tasksByStatus.finished > 0 && (
                                      <div className="flex items-center text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                                        <CheckCircle className="h-3 w-3 mr-1 text-emerald-500" />
                                        <span>{tasksByStatus.finished} finished</span>
                                      </div>
                                    )}

                                    {tasksByStatus.pending > 0 && (
                                      <div className="flex items-center text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                                        <Clock className="h-3 w-3 mr-1 text-amber-500" />
                                        <span>{tasksByStatus.pending} pending</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex items-center text-xs px-2 py-1 rounded-full bg-gray-100">
                                    <span>No tasks assigned</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {memberTasks.length > 0 && (
                          <div className="border-t px-4 py-3 bg-gray-50">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <FileText className="h-4 w-4 mr-1 text-gray-500" />
                              Assigned Tasks
                            </h4>
                            <ul className="space-y-2">
                              {memberTasks.map((task) => (
                                <li key={task.id} className="flex items-center justify-between text-sm">
                                  <span className="truncate max-w-[70%] text-gray-900">{task.title}</span>
                                  <span
                                    className={`flex items-center text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}
                                  >
                                    {getStatusIcon(task.status)}
                                    <span className="ml-1">{task.status}</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </SignedIn>
    </>
  )
}
