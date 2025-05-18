"use client"

// pages/dashboard.tsx
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs"
import { supabase } from "../lib/supabaseClient"
import { useEffect, useState } from "react"
import { CheckCircle, Clock, XCircle, RefreshCw, Loader2, Calendar, FileText, User } from "lucide-react"

export default function Dashboard() {
  const { user } = useUser()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tempStatuses, setTempStatuses] = useState<{ [taskId: string]: string }>({})
  const [activeFinishTaskId, setActiveFinishTaskId] = useState<string | null>(null)
  const [editingTaskIds, setEditingTaskIds] = useState<{ [taskId: string]: boolean }>({})
  const [finishDetails, setFinishDetails] = useState<{ [taskId: string]: { 
    date: string; 
    notes: string;
    time_consumption: number;
    difficulty: number;
  } }>({})

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) return

      const { data, error } = await supabase
        .from("tasks")
        .select("*, deadline, date_completed")
        .eq("assigned_to", user.id)
        .eq("is_deleted", false)  // ⬅️ This is the key addition


      if (error) {
        console.error("Error fetching tasks:", error)
      } else {
        console.log("Fetched tasks:", data)
        setTasks(data || [])
        // Initialize finishDetails for each task
        const initialFinishDetails = (data || []).reduce((acc, task) => ({
          ...acc,
          [task.id]: {
            date: task.date_completed || new Date().toISOString().slice(0, 10),
            notes: task.notes || "",
            time_consumption: task.time_consumption || 5,
            difficulty: task.difficulty || 5
          }
        }), {})
        setFinishDetails(initialFinishDetails)
      }

      setLoading(false)
    }

    fetchTasks()
  }, [user])

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId)

    if (error) {
      console.error("Failed to update status:", error)
      return
    }

    // Refresh tasks list locally
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const handleEditTask = (taskId: string) => {
    setEditingTaskIds(prev => ({ ...prev, [taskId]: true }))
  }

  const handleCancelEdit = (taskId: string) => {
    setEditingTaskIds(prev => ({ ...prev, [taskId]: false }))
  }

  const submitFinishedTask = async (taskId: string) => {
    const taskDetails = finishDetails[taskId] || {
      date: new Date().toISOString().slice(0, 10),
      notes: "",
      time_consumption: 5,
      difficulty: 5
    }
    const currentStatus = tempStatuses[taskId] ?? tasks.find(t => t.id === taskId)?.status ?? "pending"

    const { error } = await supabase
      .from("tasks")
      .update({
        status: currentStatus,
        date_completed: taskDetails.date,
        notes: taskDetails.notes,
        time_consumption: taskDetails.time_consumption,
        difficulty: taskDetails.difficulty
      })
      .eq("id", taskId)

    if (error) {
      console.error("Failed to finish task:", error)
      return
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { 
          ...task, 
          status: currentStatus, 
          date_completed: taskDetails.date, 
          notes: taskDetails.notes,
          time_consumption: taskDetails.time_consumption,
          difficulty: taskDetails.difficulty
        } : task,
      ),
    )

    // Reset UI
    setActiveFinishTaskId(null)
    setEditingTaskIds(prev => ({ ...prev, [taskId]: false }))
    setTempStatuses((prev) => {
      const newStatuses = { ...prev }
      delete newStatuses[taskId]
      return newStatuses
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "finished":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "cancel":
        return <XCircle className="h-5 w-5 text-rose-500" />
      case "roll":
        return <RefreshCw className="h-5 w-5 text-sky-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "cancel":
        return "bg-rose-100 text-rose-800 border-rose-200"
      case "roll":
        return "bg-sky-100 text-sky-800 border-sky-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-800">{user?.firstName}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-1 bg-purple-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <FileText className="h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No tasks assigned</h3>
                  <p className="mt-1 text-gray-500">You don't have any tasks assigned to you at the moment.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {["High", "Medium", "Low"].map((priority) => {
                    const priorityTasks = tasks.filter((task) => task.priority === priority);
                    if (priorityTasks.length === 0) return null;

                    return (
                      <div key={priority} className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-1 ${
                            priority === "High" ? "bg-red-500" :
                            priority === "Medium" ? "bg-yellow-500" :
                            "bg-green-500"
                          } rounded-full`}></div>
                          <h2 className="text-xl font-semibold text-gray-800">{priority} Priority Tasks</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                          {priorityTasks.map((task) => {
                            const currentStatus = tempStatuses[task.id] ?? task.status
                            const isEditing = editingTaskIds[task.id] || false
                            const taskFinishDetails = finishDetails[task.id] || {
                              date: new Date().toISOString().slice(0, 10),
                              notes: task.notes || "",
                              time_consumption: task.time_consumption || 5,
                              difficulty: task.difficulty || 5
                            }

                            return (
                              <div
                                key={task.id}
                                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div
                                  className={`p-4 border-l-4 ${
                                    currentStatus === "finished"
                                      ? "border-l-emerald-500"
                                      : currentStatus === "pending"
                                        ? "border-l-amber-500"
                                        : currentStatus === "cancel"
                                          ? "border-l-rose-500"
                                          : currentStatus === "roll"
                                            ? "border-l-sky-500"
                                            : "border-l-gray-500"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h3 className="font-semibold text-lg text-gray-800">{task.title}</h3>
                                      <div className="flex items-center mt-1">
                                        {getStatusIcon(currentStatus)}
                                        <span
                                          className={`ml-1.5 text-sm px-2 py-0.5 rounded-full ${getStatusColor(currentStatus)}`}
                                        >
                                          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                                        </span>
                                      </div>
                                      {task.deadline && (
                                        <div className="flex items-center mt-2 text-sm text-gray-600">
                                          <Calendar className="h-4 w-4 mr-1.5" />
                                          <span>Deadline: {new Date(task.deadline + 'T00:00:00').toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                          })}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2 mt-4">
                                    {["finished", "roll", "cancel", "pending"].map((statusOption) => (
                                      <button
                                        key={statusOption}
                                        onClick={() => {
                                          if (task.status === "finished" && !isEditing) return;
                                          setTempStatuses((prev) => ({ ...prev, [task.id]: statusOption }))

                                          if (statusOption === "finished") {
                                            setActiveFinishTaskId(task.id)
                                          } else {
                                            setActiveFinishTaskId(null)
                                            updateTaskStatus(task.id, statusOption)
                                          }
                                        }}
                                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                          currentStatus === statusOption
                                            ? `${
                                                statusOption === "finished"
                                                  ? "bg-emerald-500 text-white border-emerald-600"
                                                  : statusOption === "pending"
                                                    ? "bg-amber-500 text-white border-amber-600"
                                                    : statusOption === "cancel"
                                                      ? "bg-rose-500 text-white border-rose-600"
                                                      : "bg-sky-500 text-white border-sky-600"
                                            }`
                                          : "bg-white text-gray-700 hover:bg-gray-50"
                                        } ${task.status === "finished" && !isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={task.status === "finished" && !isEditing}
                                      >
                                        {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                      </button>
                                    ))}
                                    {task.status && !isEditing && (
                                      <button
                                        onClick={() => handleEditTask(task.id)}
                                        className="px-3 py-1.5 text-sm rounded-md border transition-colors bg-white text-gray-700 hover:bg-gray-50"
                                      >
                                        Edit
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <form
                                  className={`p-4 border-t ${activeFinishTaskId === task.id || isEditing || !task.status ? "bg-gray-50" : ""}`}
                                  onSubmit={(e) => {
                                    e.preventDefault()
                                    submitFinishedTask(task.id)
                                  }}
                                >
                                  {((activeFinishTaskId === task.id) || (isEditing && currentStatus === "finished") || (!task.status && tempStatuses[task.id] === "finished")) && (
                                    <>
                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            Date Completed
                                          </div>
                                        </label>
                                        <input
                                          type="date"
                                          value={taskFinishDetails.date}
                                          onChange={(e) => setFinishDetails(prev => ({
                                            ...prev,
                                            [task.id]: { ...taskFinishDetails, date: e.target.value }
                                          }))}
                                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                          required
                                        />
                                      </div>

                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            Time Consumption (1-10)
                                          </div>
                                        </label>
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={taskFinishDetails.time_consumption}
                                            onChange={(e) => setFinishDetails(prev => ({
                                              ...prev,
                                              [task.id]: { ...taskFinishDetails, time_consumption: parseInt(e.target.value) }
                                            }))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                          />
                                          <span className="text-sm font-medium text-gray-700 w-8 text-center">
                                            {taskFinishDetails.time_consumption}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          <div className="flex items-center">
                                            <RefreshCw className="h-4 w-4 mr-1" />
                                            Difficulty (1-10)
                                          </div>
                                        </label>
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={taskFinishDetails.difficulty}
                                            onChange={(e) => setFinishDetails(prev => ({
                                              ...prev,
                                              [task.id]: { ...taskFinishDetails, difficulty: parseInt(e.target.value) }
                                            }))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                          />
                                          <span className="text-sm font-medium text-gray-700 w-8 text-center">
                                            {taskFinishDetails.difficulty}
                                          </span>
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-1" />
                                        Important Notes
                                      </div>
                                    </label>
                                    <textarea
                                      value={activeFinishTaskId === task.id || isEditing || !task.status ? taskFinishDetails.notes : task.notes || ""}
                                      onChange={(e) => {
                                        if (activeFinishTaskId === task.id || isEditing || !task.status) {
                                          setFinishDetails(prev => ({
                                            ...prev,
                                            [task.id]: { ...taskFinishDetails, notes: e.target.value }
                                          }))
                                        } else {
                                          // Update notes directly in the database for non-finished tasks
                                          const updateNotes = async () => {
                                            const { error } = await supabase
                                              .from("tasks")
                                              .update({ notes: e.target.value })
                                              .eq("id", task.id)
                                            
                                            if (error) {
                                              console.error("Failed to update notes:", error)
                                              return
                                            }
                                            
                                            setTasks((prevTasks) =>
                                              prevTasks.map((t) =>
                                                t.id === task.id ? { ...t, notes: e.target.value } : t
                                              )
                                            )
                                          }
                                          updateNotes()
                                        }
                                      }}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                      rows={3}
                                      required={activeFinishTaskId === task.id || isEditing || !task.status}
                                      disabled={!activeFinishTaskId && !isEditing && task.status}
                                    />
                                  </div>

                                  {(activeFinishTaskId === task.id || isEditing || !task.status) && (
                                    <div className="mt-4 flex justify-end">
                                      <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      >
                                        Submit
                                      </button>
                                    </div>
                                  )}
                                </form>
                              </div>
                            )
                          })}
                        </div>
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
