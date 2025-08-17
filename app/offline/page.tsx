// app/offline/page.tsx (if using app router)
"use client";
import React from "react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
      <h1 className="text-2xl font-bold mb-4">You are Offline</h1>
      <p className="text-gray-600">
        It seems you don’t have an internet connection.  
        Please reconnect to continue using the app.
      </p>
    </div>
  );
}
