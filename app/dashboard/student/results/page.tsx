"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Result {
  _id: string;
  title: string;
  class: string;
  section: string;
  subject: string;
  examDate: string;
  resultDate: string;
  url: string;
  isActive: boolean;
  createdBy: string;
  description?: string;
  createdAt: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("/api/students/results");
        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <p className="p-4">Loading results...</p>;

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6 gap-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">All Results</h1>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => (
          <div
            key={result._id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer bg-white"
            onClick={() => setSelectedResult(result)}
          >
            <h2 className="font-bold text-lg">{result.title}</h2>
            <p className="text-sm text-gray-600">
              Class: {result.class} - Section: {result.section}
            </p>
            <p className="text-sm">Subject: {result.subject}</p>
            <p className="text-xs text-gray-500">
              Result Date: {new Date(result.resultDate).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Modal for Full Details */}
      {selectedResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setSelectedResult(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-2">{selectedResult.title}</h2>
            <p className="text-sm text-gray-600 mb-2">
              Class: {selectedResult.class} - Section: {selectedResult.section}
            </p>
            <p className="mb-2">Subject: {selectedResult.subject}</p>
            <p className="mb-2">
              Exam Date: {new Date(selectedResult.examDate).toLocaleDateString()}
            </p>
            <p className="mb-2">
              Result Date: {new Date(selectedResult.resultDate).toLocaleDateString()}
            </p>

            {selectedResult.url && (
              <p className="mb-4">
                <a
                  href={selectedResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Result Resource
                </a>
              </p>
            )}

            <p className="mb-4">
              {selectedResult.description?.trim()
                ? selectedResult.description
                : "No description provided."}
            </p>

            <p className="mt-4 text-xs text-gray-500">
              Created by {selectedResult.createdBy} on{" "}
              {new Date(selectedResult.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
