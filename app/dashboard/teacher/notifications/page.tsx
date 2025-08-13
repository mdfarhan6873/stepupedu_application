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
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <p className="text-gray-600">No notifications found.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="border rounded-lg p-4 shadow bg-white hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-indigo-700">
                  {n.title}
                </h2>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    n.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : n.priority === "normal"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {n.priority}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{n.message}</p>
              <p className="text-gray-400 text-xs mt-3">
                {formatDate(n.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
