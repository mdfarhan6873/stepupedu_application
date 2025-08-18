"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ChartBarIcon, CalendarIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  All Results
                </h1>
                <p className="text-xs text-gray-500">View your exam results</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {results.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
            <p className="text-gray-600">Your exam results will appear here once published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => (
              <div
                key={result._id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/50 cursor-pointer group"
                onClick={() => setSelectedResult(result)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {result.subject}
                  </span>
                </div>
                
                <h2 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{result.title}</h2>
                
                <div className="space-y-2 mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Class {result.class} - Section {result.section}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Result: {new Date(result.resultDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-blue-600 font-semibold">Tap to view details</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Full Details */}
      {selectedResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full relative overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
              <button
                onClick={() => setSelectedResult(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
              >
                ✕
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedResult.title}</h2>
                  <p className="text-blue-100 text-sm">
                    Class {selectedResult.class} - Section {selectedResult.section}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Subject</h3>
                  <p className="text-gray-700">{selectedResult.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Exam Date
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {new Date(selectedResult.examDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Result Date
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {new Date(selectedResult.resultDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedResult.description?.trim() && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedResult.description}
                    </p>
                  </div>
                )}

                {selectedResult.url && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Result Resource</h3>
                    <a
                      href={selectedResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      View Result
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Created by {selectedResult.createdBy} on{" "}
                  {new Date(selectedResult.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
