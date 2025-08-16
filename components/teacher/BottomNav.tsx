"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Plus, Bell, CheckSquare, Calendar, Clock, CreditCard } from "lucide-react";
import Link from "next/link";

export default function BottomNav() {
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const router = useRouter();

  const quickLinks = [
    { name: "Mark Attendance", href: "/dashboard/teacher/studentattendancemanage", icon: CheckSquare, color: "bg-blue-100 text-blue-600" },
    { name: "Schedules", href: "/dashboard/teacher/schedules", icon: Calendar, color: "bg-purple-100 text-purple-600" },
    { name: "My Attendance", href: "/dashboard/teacher/my-attendance", icon: Clock, color: "bg-indigo-100 text-indigo-600" },
    { name: "My Payments", href: "/dashboard/teacher/payments", icon: CreditCard, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <>
      {/* Backdrop for closing quick links */}
      {showQuickLinks && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setShowQuickLinks(false)}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/20 px-4 py-3 rounded-t-3xl shadow-2xl z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {/* Home */}
          <Link
            href="/dashboard/teacher"
            className="flex flex-col items-center space-y-1 p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-semibold">Home</span>
          </Link>

          {/* Quick Links */}
          <div className="relative">
            <button
              onClick={() => setShowQuickLinks(!showQuickLinks)}
              className="flex flex-col items-center space-y-1 p-3 rounded-2xl text-gray-600 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold">Quick</span>
            </button>

            {/* Quick Links Menu */}
            {showQuickLinks && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 py-3 min-w-[200px] max-h-80 overflow-y-auto z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800">Quick Actions</h3>
                </div>
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setShowQuickLinks(false)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center space-x-3"
                    >
                      <div className={`w-8 h-8 ${link.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications */}
          <Link
            href="/dashboard/teacher/notifications"
            className="flex flex-col items-center space-y-1 p-3 rounded-2xl text-gray-600 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          >
            <Bell className="w-6 h-6" />
            <span className="text-xs font-semibold">Notifications</span>
          </Link>
        </div>
      </div>
    </>
  );
}
