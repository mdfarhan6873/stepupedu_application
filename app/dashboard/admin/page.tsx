"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import StudentForm from "@/components/forms/StudentForm";
import TeacherForm from "@/components/forms/TeacherForm";
import StudentWhatsappForm from "@/components/forms/StudentWhatsappForm";
import TeacherWhatsappForm from "@/components/forms/TeacherWhatsappForm";
import NotesForm from "@/components/forms/NotesForm";
import ScheduleForm from "@/components/forms/ScheduleForm";
import NotificationForm from "@/components/forms/NotificationForm";
import ResultsForm from "@/components/forms/ResultsForm";

type QuickAddType = 'student' | 'teacher' | 'studentWhatsapp' | 'teacherWhatsapp' | 'notes' | 'schedule' | 'notification' | 'result' | null;

interface QuickAddModalProps {
  type: QuickAddType;
  onClose: () => void;
  onSuccess: () => void;
}

function QuickAddModal({ type, onClose, onSuccess }: QuickAddModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any, endpoint: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save');
      }
    } catch (error) {
      alert('An error occurred while saving');
    }
    setIsLoading(false);
  };

  if (!type) return null;

  const forms = {
    student: (
      <StudentForm
        onSubmit={(data) => handleSubmit(data, '/api/admin/students')}
        onCancel={onClose}
        isLoading={isLoading}
      />
    ),
    teacher: (
      <TeacherForm
        onSubmit={(data) => handleSubmit(data, '/api/admin/teachers')}
        onCancel={onClose}
        isLoading={isLoading}
      />
    ),
    studentWhatsapp: (
      <StudentWhatsappForm
        onSubmit={(data) => handleSubmit(data, '/api/admin/student-whatsapp')}
        onCancel={onClose}
        isLoading={isLoading}
      />
    ),
    teacherWhatsapp: (
      <TeacherWhatsappForm
        onSubmit={(data) => handleSubmit(data, '/api/admin/teacher-whatsapp')}
        onCancel={onClose}
        isLoading={isLoading}
      />
    ),
    notes: (
      <NotesForm
        onSubmit={(data) => handleSubmit(data, '/api/admin/notes')}
        onCancel={onClose}
        isLoading={isLoading}
      />
    ),
    schedule: (
      <ScheduleForm
        onSubmit={(data) => handleSubmit(data, '/api/admin/schedule')}
        onCancel={onClose}
        isLoading={isLoading}
      />
    ),
    notification: (
      <NotificationForm
        onSubmit={(data) => handleSubmit(data, '/api/admin/notifications')}
        onCancel={onClose}
        isLoading={isLoading}
      />
    ),
    result: (
      <ResultsForm
        onSubmit={(data) => handleSubmit(data, '/api/admin/results')}
        onCancel={onClose}
        isLoading={isLoading}
      />
    )
  };

  return forms[type] || null;
}

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  totalProfit: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quickAddModal, setQuickAddModal] = useState<QuickAddType>(null);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ totalStudents: 0, totalTeachers: 0, totalRevenue: 0, totalProfit: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFormSuccess = () => {
    // Refresh stats when a new item is added
    fetchStats();
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "admin") {
      router.push(`/dashboard/${session.user.role}`);
      return;
    }

    fetchStats();
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

  if (!session || session.user.role !== "admin") {
    return null;
  }

  const managementIcons = [
    {
      name: "Manage Students",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      href: "/dashboard/admin/students",
      color: "bg-blue-100 text-blue-600"
    },
    {
      name: "Manage Teachers",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: "/dashboard/admin/teachers",
      color: "bg-green-100 text-green-600"
    },
    {
      name: "Schedule",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: "/dashboard/admin/schedule",
      color: "bg-purple-100 text-purple-600"
    },
    {
      name: "Notes",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      href: "/dashboard/admin/notes",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      name: "Student WhatsApp",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
        </svg>
      ),
      href: "/dashboard/admin/student-whatsapp",
      color: "bg-green-100 text-green-600"
    },
    {
      name: "Teacher WhatsApp",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      href: "/dashboard/admin/teacher-whatsapp",
      color: "bg-teal-100 text-teal-600"
    },
    {
      name: "Attendance",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      href: "/dashboard/admin/attendance",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      name: "Results",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: "/dashboard/admin/results",
      color: "bg-red-100 text-red-600"
    },
    {
      name: "Student Payments",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: "/dashboard/admin/student-payments",
      color: "bg-orange-100 text-orange-600"
    },
    {
      name: "Teacher Payments",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      href: "/dashboard/admin/teacher-payments",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      name: "Notifications",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      href: "/dashboard/admin/notifications",
      color: "bg-pink-100 text-pink-600"
    },
    {
      name: "Settings",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: "/dashboard/admin/settings",
      color: "bg-gray-100 text-gray-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.png"
                alt="StepUpEdu Logo"
                width={40}
                height={40}
                className="rounded-full"
              />

            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Welcome, {session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="">
          
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-8">
            {/* Dashboard Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Students */}
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <div className="text-2xl font-bold text-gray-900">
                      {statsLoading ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-8 w-12 rounded"></span>
                      ) : (
                        stats.totalStudents.toLocaleString()
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a4 4 0 110-5.292M15 21H3v-1a6 6 0 0112 0v1z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Teachers */}
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                    <div className="text-2xl font-bold text-gray-900">
                      {statsLoading ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-8 w-12 rounded"></span>
                      ) : (
                        stats.totalTeachers.toLocaleString()
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <div className="text-2xl font-bold text-gray-900">
                      {statsLoading ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                      ) : (
                        `₹${stats.totalRevenue.toLocaleString()}`
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Profit */}
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Profit</p>
                    <div
                      className={`text-2xl font-bold ${stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {statsLoading ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                      ) : (
                        `₹${stats.totalProfit.toLocaleString()}`
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.totalProfit >= 0
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                      }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={
                          stats.totalProfit >= 0
                            ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                        }
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>




          {/* Management Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {managementIcons.map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.href)}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 text-center">{item.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 rounded-t-3xl">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {/* Home */}
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-indigo-100 text-indigo-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* Quick Add */}
          <div className="relative">
            <button
              onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-xs font-medium">Add</span>
            </button>

            {/* Quick Add Menu */}
            {showQuickAddMenu && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg border py-2 min-w-[180px] max-h-80 overflow-y-auto">
                <button
                  onClick={() => {
                    setQuickAddModal('student');
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Add Student
                </button>
                <button
                  onClick={() => {
                    setQuickAddModal('teacher');
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Add Teacher
                </button>
                <button
                  onClick={() => {
                    setQuickAddModal('studentWhatsapp');
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Student WhatsApp Group
                </button>
                <button
                  onClick={() => {
                    setQuickAddModal('teacherWhatsapp');
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Teacher WhatsApp Group
                </button>
                <button
                  onClick={() => {
                    setQuickAddModal('notes');
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Add Note
                </button>
                <button
                  onClick={() => {
                    setQuickAddModal('schedule');
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Create Schedule
                </button>
                <button
                  onClick={() => {
                    setQuickAddModal('result');
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Add Result
                </button>
                <button
                  onClick={() => {
                    setQuickAddModal('notification');
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Send Notification
                </button>
              </div>
            )}
          </div>

          {/* Messages/Enquiry */}
          <button className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Messages</span>
          </button>
        </div>
      </div>

      {/* Quick Add Modals */}
      <QuickAddModal
        type={quickAddModal}
        onClose={() => setQuickAddModal(null)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
