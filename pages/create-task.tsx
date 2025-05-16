"use client"

import type React from "react"

import { SignedIn, SignedOut, RedirectToSignIn, useUser, useOrganization } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import { CheckCircle, AlertTriangle, Calendar, Users, FileText, ArrowRight, Loader2 } from "lucide-react"

export default function CreateTask() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const [members, setMembers] = useState<{ id: string; name: string }[]>([])
  const [title, setTitle] = useState("")
  const [assignee, setAssignee] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [deadline, setDeadline] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ⏱ Calculate upcoming Friday
  useEffect(() => {
    const today = new Date()
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7
    const nextFriday = new Date(today)
    nextFriday.setDate(today.getDate() + daysUntilFriday)
    setDeadline(nextFriday.toISOString().split("T")[0]) // format: yyyy-mm-dd
  }, [])

  // 🧑‍🤝‍🧑 Load members from org
  useEffect(() => {
    const fetchMembers = async () => {
      if (!organization) return
      setLoading(true)

      try {
        const res = await fetch(`/api/get-org-members?orgId=${organization.id}`)
        const data = await res.json()
        setMembers(data)
      } catch (err) {
        console.error("Failed to fetch members:", err)
        setError("Could not load organization members.")
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [organization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!title.trim() || !assignee.trim()) {
      setError("All fields are required.")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("tasks").insert({
      title,
      assigned_to: assignee,
      status: "pending",
      priority,
      deadline,
      team_id: organization?.id,
      username: user?.firstName || user?.username || "Unknown",
      organization_name: organization?.name || "Unknown"
    })

    if (insertError) {
      console.error("Error creating task:", insertError)
      setError("Error creating task.")
    } else {
      setSubmitted(true)
      setTitle("")
      setAssignee("")
      setPriority("Medium")
      // leave deadline as is

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
      }, 3000)
    }

    setLoading(false)
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-10 w-1 bg-purple-500 rounded-full"></div>
                  <h1 className="text-xl font-semibold text-gray-800">Assign a New Task</h1>
                </div>

                {submitted && (
                  <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-emerald-800 font-medium">Task created successfully!</p>
                      <p className="text-emerald-600 text-sm">The task has been assigned and is now pending.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start">
                    <AlertTriangle className="h-5 w-5 text-rose-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-rose-800 font-medium">Error</p>
                      <p className="text-rose-600 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Task Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-gray-500" />
                        Task Title
                      </div>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., Email client"
                    />
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        Assign To
                      </div>
                    </label>
                    <select
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select a member</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setPriority("High")}
                        className={`flex-1 py-2.5 px-4 rounded-md border transition-colors ${
                          priority === "High"
                            ? "bg-rose-500 text-white border-rose-600"
                            : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
                        }`}
                      >
                        High
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority("Medium")}
                        className={`flex-1 py-2.5 px-4 rounded-md border transition-colors ${
                          priority === "Medium"
                            ? "bg-amber-500 text-white border-amber-600"
                            : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                        }`}
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority("Low")}
                        className={`flex-1 py-2.5 px-4 rounded-md border transition-colors ${
                          priority === "Low"
                            ? "bg-emerald-500 text-white border-emerald-600"
                            : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        }`}
                      >
                        Low
                      </button>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        Deadline
                      </div>
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Defaults to this week's Friday.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md font-medium transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Task...
                      </>
                    ) : (
                      <>
                        Create Task
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </SignedIn>
    </>
  )
}
