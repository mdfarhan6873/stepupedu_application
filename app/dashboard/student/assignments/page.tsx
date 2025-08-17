"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const Assignments = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-md shadow-md">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-200 rounded-full transition"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Assignments</h1>
      </header>

      {/* Body */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center p-10 bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl max-w-md w-full border border-gray-200">
          {/* Icon / Illustration */}
          <div className="flex justify-center mb-5">
            <span className="text-6xl">📘</span>
          </div>

          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The <span className="font-semibold text-purple-600">Assignments</span> 
            section is currently under development.  
            We’ll update you once it’s live!
          </p>

          <div className="flex justify-center">
            <span className="px-5 py-2 text-sm rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold shadow">
              ⏳ Work in Progress
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Assignments;
