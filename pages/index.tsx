"use client"

import { useState } from "react"
import { SignedIn, SignedOut, useUser, SignInButton } from "@clerk/nextjs"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  RefreshCw,
  Calendar,
  FileText,
  User,
  ChevronRight,
  BarChart2,
} from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const { user } = useUser()
  const [showDemo, setShowDemo] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Manage your tasks with <span className="text-purple-600">clarity</span> and{" "}
              <span className="text-purple-600">purpose</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Lavure helps you organize, prioritize, and complete your tasks efficiently. Track progress, set
              deadlines, and boost your productivity.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
                >
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </SignedIn>
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                See How It Works
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-1 bg-purple-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-800">Task Overview</h2>
            </div>
            <div className="space-y-4">
              {[
                { title: "Complete project proposal", status: "pending", priority: "High", deadline: "2023-06-15" },
                { title: "Review marketing materials", status: "finished", priority: "Medium", deadline: "2023-06-10" },
                { title: "Schedule team meeting", status: "roll", priority: "Low", deadline: "2023-06-20" },
              ].map((task, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg border-l-4 ${
                    task.status === "finished"
                      ? "border-l-emerald-500"
                      : task.status === "pending"
                        ? "border-l-amber-500"
                        : task.status === "roll"
                          ? "border-l-sky-500"
                          : "border-l-gray-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{task.title}</h3>
                      <div className="flex items-center mt-1">
                        {task.status === "finished" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : task.status === "pending" ? (
                          <Clock className="h-4 w-4 text-amber-500" />
                        ) : (
                          <RefreshCw className="h-4 w-4 text-sky-500" />
                        )}
                        <span
                          className={`ml-1.5 text-xs px-2 py-0.5 rounded-full ${
                            task.status === "finished"
                              ? "bg-emerald-100 text-emerald-800"
                              : task.status === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sky-100 text-sky-800"
                          }`}
                        >
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === "High"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.priority}
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      Due:{" "}
                      {new Date(task.deadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {showDemo && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">How Lavure Works</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Our intuitive task management system helps you stay organized and productive
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Tasks</h3>
                <p className="text-gray-600">
                  Easily create and organize tasks with priorities, deadlines, and detailed descriptions.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-gray-600">
                  Update task statuses and track your progress with visual indicators and notifications.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyze Performance</h3>
                <p className="text-gray-600">
                  Use our AI generated reports to gain insights into your productivity with detailed analytics and performance metrics.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-purple-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 md:p-12 md:flex md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white md:text-3xl">Ready to boost your productivity?</h2>
              <p className="mt-3 text-purple-100 max-w-3xl">
                Join others who have transformed their task management experience with Lavure.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-purple-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white flex items-center">
                    Get Started <ChevronRight className="ml-2 h-5 w-5" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-purple-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white flex items-center"
                >
                  Go to Dashboard <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/lavure.png"
                alt="Lavure Logo"
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="text-xl font-bold text-gray-900">Lavure</span>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Lavure. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
