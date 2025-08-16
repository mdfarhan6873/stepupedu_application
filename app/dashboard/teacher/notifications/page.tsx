"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Notification {
  _id: string;
  title: string;
  message: string;
  targetAudience: string;
  priority: "low" | "normal" | "high";
  createdAt: string;
}

export default function TeacherNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/teacher/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-all duration-200 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-2xl hover:bg-white/80 shadow-sm hover:shadow-md"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-sm text-gray-500">Stay updated with important announcements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg font-medium">No notifications found</p>
            <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n._id}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-white/50 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 ${
                      n.priority === "high"
                        ? "bg-gradient-to-br from-red-500 to-red-600"
                        : n.priority === "normal"
                        ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                        : "bg-gradient-to-br from-green-500 to-green-600"
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">
                        {n.title}
                      </h2>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                      n.priority === "high"
                        ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                        : n.priority === "normal"
                        ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700"
                        : "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                    }`}
                  >
                    {n.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{n.message}</p>
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl px-3 py-2">
                    <p className="text-gray-700 text-xs font-medium">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                  <div className="text-indigo-600 group-hover:translate-x-1 transition-transform duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
