"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "student") {
      router.push(`/dashboard/${session.user.role}`);
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "student") return null;

  const dashboardItems = [
    { name: "Schedule", icon: CalendarIcon, href: "/dashboard/student/schedule" },
    { name: "My Payments", icon: CurrencyDollarIcon, href: "/dashboard/student/payments" },
    { name: "My Attendance", icon: ClipboardDocumentIcon, href: "/dashboard/student/attendance" },
    { name: "Notes", icon: BookOpenIcon, href: "/dashboard/student/notes" },
    { name: "Results", icon: ChartBarIcon, href: "/dashboard/student/results" },
    { name: "Assignments", icon: ClipboardDocumentListIcon, href: "/dashboard/student/assignments" },
  ];

  const bottomNavItems = [
    { name: "Home", icon: HomeIcon, href: "/dashboard/student" },
    { name: "Pay", icon: CurrencyDollarIcon, href: "/dashboard/student/payments" },
    { name: "Notifications", icon: BellIcon, href: "/dashboard/student/notifications" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <Image src="/logo.png" alt="StepUpEdu Logo" width={40} height={40} className="rounded-full" />
              <h1 className="text-xl font-bold text-gray-800 hidden md:block">Student Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-700">Welcome, {session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {dashboardItems.map((item) => (
            <div
              key={item.name}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition"
            >
              <item.icon className="w-10 h-10 text-indigo-600 mb-2" />
              <span className="text-gray-800 font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="bg-white shadow-inner md:hidden">
        <div className="flex justify-around items-center h-16">
          {bottomNavItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center justify-center text-gray-600 hover:text-indigo-600 transition"
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
