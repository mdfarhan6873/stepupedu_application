"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Plus, Bell } from "lucide-react";
import Link from "next/link";

export default function BottomNav() {
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg flex justify-around items-center py-2 z-50">
        <Link href="/dashboard/teacher" className="flex flex-col items-center text-gray-600">
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>
        <button
          onClick={() => setShowQuickLinks(true)}
          className="flex flex-col items-center text-gray-600"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs">Quick</span>
        </button>
        <Link href="/dashboard/teacher/notifications" className="flex flex-col items-center text-gray-600">
          <Bell className="w-6 h-6" />
          <span className="text-xs">Notifications</span>
        </Link>
      </nav>

      {/* Quick Links Popup */}
      {showQuickLinks && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-72 p-4">
            <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard/teacher/mark-attendance" className="text-blue-600">Mark Attendance</Link>
              <Link href="/dashboard/teacher/schedules" className="text-blue-600">Schedules</Link>
              <Link href="/dashboard/teacher/my-attendance" className="text-blue-600">My Attendance</Link>
              <Link href="/dashboard/teacher/payments" className="text-blue-600">My Payments</Link>
            </div>
            <button
              onClick={() => setShowQuickLinks(false)}
              className="mt-4 w-full bg-gray-200 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
