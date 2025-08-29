"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

interface WhatsAppGroup {
  groupName: string;
  class: string;
  section: string;
  groupLink: string;
  description?: string;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [whatsappGroup, setWhatsappGroup] = useState<WhatsAppGroup | null>(null);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(true);

  const fetchWhatsappGroup = async () => {
    try {
      const response = await fetch('/api/students/student-whatsapp');
      if (response.ok) {
        const result = await response.json();
        setWhatsappGroup(result.data);
      } else {
        console.log('No WhatsApp group found for this student');
      }
    } catch (error) {
      console.error('Error fetching WhatsApp group:', error);
    } finally {
      setLoadingWhatsapp(false);
    }
  };

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
    
    // Fetch WhatsApp group data
    fetchWhatsappGroup();
  }, [session, status, router]);

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

  if (!session || session.user.role !== "student") return null;

  const dashboardItems = [
    { 
      name: "Schedule", 
      icon: CalendarIcon, 
      href: "/dashboard/student/schedule",
      color: "bg-purple-100 text-purple-600",
      gradient: "from-purple-500 to-purple-600"
    },
    { 
      name: "My Payments", 
      icon: CurrencyDollarIcon, 
      href: "/dashboard/student/payments",
      color: "bg-green-100 text-green-600",
      gradient: "from-green-500 to-green-600"
    },
    { 
      name: "My Attendance", 
      icon: ClipboardDocumentIcon, 
      href: "/dashboard/student/attendance",
      color: "bg-blue-100 text-blue-600",
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      name: "Notes", 
      icon: BookOpenIcon, 
      href: "/dashboard/student/notes",
      color: "bg-yellow-100 text-yellow-600",
      gradient: "from-yellow-500 to-yellow-600"
    },
    { 
      name: "Results", 
      icon: ChartBarIcon, 
      href: "/dashboard/student/results",
      color: "bg-red-100 text-red-600",
      gradient: "from-red-500 to-red-600"
    },
    { 
      name: "My Marksheets", 
      icon: ChartBarIcon, 
      href: "/dashboard/student/mymarksheets",
      color: "bg-red-100 text-red-600",
      gradient: "from-orange-500 to-stone-600"
    },
    { 
      name: "Assignments", 
      icon: ClipboardDocumentListIcon, 
      href: "/dashboard/student/assignments",
      color: "bg-indigo-100 text-indigo-600",
      gradient: "from-indigo-500 to-indigo-600"
    },
  ];

  const bottomNavItems = [
    { name: "Profile", icon: UsersIcon, href: "/dashboard/student/profile" },
    { name: "Pay Fees", icon: CurrencyRupeeIcon, href: "/dashboard/student/pay" },
    { name: "Notifications", icon: BellIcon, href: "/dashboard/student/notifications" },
  ];

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
                  Student Dashboard
                </h1>
                <p className="text-xs text-gray-500">StepUpEdu Learning Portal</p>
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
              <h2 className="text-2xl font-bold mb-2">Learning Portal</h2>
              <p className="text-indigo-100 text-sm">Access your courses, track progress, and stay connected</p>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Dashboard Items */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Quick Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {dashboardItems.map((item) => (
              <div
                key={item.name}
                onClick={() => router.push(item.href)}
                className="bg-white/70 backdrop-blur-sm p-5 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/50 group cursor-pointer"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xs font-semibold text-gray-800 text-center leading-tight">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Group Section */}
        {!loadingWhatsapp && whatsappGroup && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Class WhatsApp Group</h3>
            <div 
              onClick={() => window.open(whatsappGroup.groupLink, '_blank')}
              className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative z-10 flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-1">{whatsappGroup.groupName}</h4>
                  <p className="text-green-100 text-sm mb-2">Class {whatsappGroup.class} - Section {whatsappGroup.section}</p>
                  {whatsappGroup.description && (
                    <p className="text-green-100 text-xs">{whatsappGroup.description}</p>
                  )}
                  <p className="text-green-100 text-xs mt-2 font-semibold">Tap to join WhatsApp group</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/20 px-4 py-3 rounded-t-3xl shadow-2xl md:hidden">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {bottomNavItems.map((item, index) => (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
                index === 0 
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
