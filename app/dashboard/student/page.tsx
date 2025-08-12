"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
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

  if (!session || session.user.role !== "student") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <span className="text-gray-700">Welcome, {session?.user?.name}</span>
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

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Student Portal
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Access your courses, assignments, and academic progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
