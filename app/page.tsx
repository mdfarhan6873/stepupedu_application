"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Wait until session is fetched

    if (session?.user?.role) {
      // Redirect based on role
      if (session.user.role === "admin") router.push("/dashboard/admin");
      else if (session.user.role === "teacher") router.push("/dashboard/teacher");
      else if (session.user.role === "student") router.push("/dashboard/student");
    } else if (status === "unauthenticated") {
      // If not logged in, redirect to login after 3 sec
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-6">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="StepUpEdu Logo"
            width={250}
            height={250}
            className="rounded-full shadow-lg"
          />
        </div>

        {/* Tagline */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          StepUpEdu
        </h1>
        <p className="text-gray-600 text-center text-sm max-w-xs">
          Empowering minds, shaping futures
        </p>
      </div>

      {/* Loading Icon */}
      <div className="mb-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      {/* Powered By */}
      <div className="absolute bottom-8 text-center">
        <p className="text-gray-500 text-xs">
          Powered by{" "}
          <span className="font-semibold text-indigo-600">stepupedu.site</span>
        </p>
      </div>
    </div>
  );
}
