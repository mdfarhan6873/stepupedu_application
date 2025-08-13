"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import BottomNav from "@/components/teacher/BottomNav";
import Link from "next/link";
import { Calendar, CheckSquare, CreditCard, Clock } from "lucide-react"; // example icons

interface WhatsappGroup {
  _id: string;
  link: string;
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [group, setGroup] = useState<WhatsappGroup | null>(null);

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

  // Fetch WhatsApp group link
  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetch("/api/teacher-whatsapp");
        if (res.ok) {
          const data = await res.json();
          setGroup(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchGroup();
  }, []);

  const features = [
    { name: "Mark Attendance", path: "/dashboard/teacher/studentattendancemanage", icon: CheckSquare },
    { name: "Schedules", path: "/dashboard/teacher/schedules", icon: Calendar },
    { name: "My Attendance", path: "/dashboard/teacher/my-attendance", icon: Clock },
    { name: "My Payments", path: "/dashboard/teacher/payments", icon: CreditCard },
  ];

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

  if (!session || session.user.role !== "teacher") {
    return null;
  }

  return (
    <div className="pb-16 min-h-screen bg-gray-50 flex flex-col">
      {/* Header - unchanged */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="StepUpEdu Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-800">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <span className="text-gray-700">
                  Welcome, {session?.user?.name}
                </span>
              </div>
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

      {/* Main Section */}
      <div className="p-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.name}
              href={f.path}
              className="flex flex-col items-center p-4 bg-white rounded-xl shadow hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              <Icon className="h-8 w-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 text-center">{f.name}</span>
            </Link>
          );
        })}
      </div>

      {/* WhatsApp Group Card */}
      {group && (
        <div className="px-4 mt-4">
          <a
            href={group.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green-500 text-white p-4 rounded-xl shadow-lg hover:bg-green-600 transition-colors"
          >
           
            <span className="font-medium text-lg">Join WhatsApp Group</span>
          </a>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
