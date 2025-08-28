"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ResultsForm from "@/components/forms/ResultsForm";

interface Result {
  _id: string;
  title: string;
  class: string;
  section: string;
  subject: string;
  examDate: string;
  resultDate: string;
  url: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export default function ResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
    
    fetchResults();
  }, [session, status, router]);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/admin/results');
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const url = editingResult 
        ? `/api/admin/results/${editingResult._id}`
        : '/api/admin/results';
      
      const method = editingResult ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchResults();
        setShowForm(false);
        setEditingResult(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save result');
      }
    } catch (error) {
      alert('An error occurred while saving the result');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (resultId: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    
    try {
      const response = await fetch(`/api/admin/results/${resultId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchResults();
      } else {
        alert('Failed to delete result');
      }
    } catch (error) {
      alert('An error occurred while deleting the result');
    }
  };

  const handleEdit = (result: Result) => {
    setEditingResult(result);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingResult(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-stone-600 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Results</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first result.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <div key={result._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{result.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(result)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(result._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Subject:</span> {result.subject}</p>
                    <p><span className="font-medium">Class:</span> {result.class} - Section {result.section}</p>
                    <p><span className="font-medium">Exam Date:</span> {new Date(result.examDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Result Date:</span> {new Date(result.resultDate).toLocaleDateString()}</p>
                    {result.description && (
                      <p><span className="font-medium">Description:</span> {result.description}</p>
                    )}
                    <p><span className="font-medium">Added by:</span> {result.createdBy}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        result.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View Result →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <ResultsForm
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isSubmitting}
          initialData={editingResult}
        />
      )}
    </div>
  );
}
