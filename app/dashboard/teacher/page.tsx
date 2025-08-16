"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import BottomNav from "@/components/teacher/BottomNav";
import Link from "next/link";
import { Calendar, CheckSquare, CreditCard, Clock, MessageCircle } from "lucide-react";

interface WhatsappGroup {
  _id: string;
  groupName: string;
  groupLink: string;
  description?: string;
  isActive: boolean;
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<WhatsappGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  // Auth checks
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "teacher") {
      router.push(`/dashboard/${session.user.role}`);
    }
  }, [session, status, router]);

  // Fetch WhatsApp groups
  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await fetch("/api/teacher-whatsapp");
        if (res.ok) {
          const response = await res.json();
          if (response.success && response.data) {
            setGroups(response.data.filter((group: WhatsappGroup) => group.isActive));
          }
        }
      } catch (err) {
        console.error("Error fetching WhatsApp groups:", err);
      } finally {
        setGroupsLoading(false);
      }
    }
    
    if (session?.user?.role === "teacher") {
      fetchGroups();
    }
  }, [session]);

  const features = [
    { 
      name: "Mark Attendance", 
      path: "/dashboard/teacher/studentattendancemanage", 
      icon: CheckSquare,
      color: "bg-blue-100 text-blue-600",
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      name: "Schedules", 
      path: "/dashboard/teacher/schedules", 
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
      gradient: "from-purple-500 to-purple-600"
    },
    { 
      name: "My Attendance", 
      path: "/dashboard/teacher/my-attendance", 
      icon: Clock,
      color: "bg-indigo-100 text-indigo-600",
      gradient: "from-indigo-500 to-indigo-600"
    },
    { 
      name: "My Payments", 
      path: "/dashboard/teacher/payments", 
      icon: CreditCard,
      color: "bg-orange-100 text-orange-600",
      gradient: "from-orange-500 to-orange-600"
    },
  ];

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "teacher") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="StepUpEdu Logo"
                  width={44}
                  height={44}
                  className="rounded-full shadow-lg border-2 border-white/50"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Teacher Dashboard
                </h1>
                <p className="text-xs text-gray-500">StepUpEdu Teaching Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-800">Welcome back!</p>
                <p className="text-xs text-gray-500">{session?.user?.name}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-24 px-4 sm:px-6">
        {/* Welcome Section */}
        <div className="pt-6 pb-4">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Teacher Portal</h2>
              <p className="text-indigo-100 text-sm">Manage your classes and track your progress</p>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.name}
                  href={feature.path}
                  className="bg-white/70 backdrop-blur-sm p-5 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/50 group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-800 text-center leading-tight">{feature.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>

        {/* WhatsApp Groups Section */}
        {!groupsLoading && groups.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Communication</h3>
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group._id} className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
                  <a
                    href={group.groupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-6 hover:bg-green-50/50 transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-1">{group.groupName}</h4>
                      <p className="text-sm text-gray-600">
                        {group.description || "Connect with other teachers and stay updated"}
                      </p>
                    </div>
                    <div className="text-green-600 group-hover:translate-x-1 transition-transform duration-200">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state for WhatsApp groups */}
        {groupsLoading && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Communication</h3>
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
