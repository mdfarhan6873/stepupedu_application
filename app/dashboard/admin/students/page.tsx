



"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StudentForm from "@/components/forms/StudentForm";

interface Student {
  _id: string;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  mobileNo: string;
  password: string;
  parentName: string;
  parentMobileNo: string;
  address: string;
  createdAt: string;
}

export default function StudentsManagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchStudents();
  }, [session, status, router]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/students/passwords");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
    setLoading(false);
  };

  const handleAddStudent = async (studentData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
      if (response.ok) {
        fetchStudents();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add student");
      }
    } catch {
      alert("An error occurred while adding the student");
    }
    setIsSubmitting(false);
  };

  const handleEditStudent = async (studentData: any) => {
    if (!editingStudent) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/students/${editingStudent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
      if (response.ok) {
        fetchStudents();
        setEditingStudent(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update student");
      }
    } catch {
      alert("An error occurred while updating the student");
    }
    setIsSubmitting(false);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const response = await fetch(`/api/admin/students/${studentId}`, { method: "DELETE" });
      if (response.ok) {
        fetchStudents();
      } else {
        alert("Failed to delete student");
      }
    } catch {
      alert("An error occurred while deleting the student");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // 🔹 Added section filter here
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobileNo.includes(searchTerm);

    const matchesClass = selectedClass === "" || student.class === selectedClass;
    const matchesSection = selectedSection === "" || student.section === selectedSection;

    return matchesSearch && matchesClass && matchesSection;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Manage Students</h1>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students
              </label>
              <input
                type="text"
                placeholder="Search by name, roll number, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Classes</option>
                {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            {/* 🔹 Section Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Sections</option>
                {["A", "B", "C", "D", "E", "F"].map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.class} - {student.section}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingStudent(student)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Roll No:</span>
                  <span className="font-medium">{student.rollNo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mobile:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{student.mobileNo}</span>
                    <button
                      onClick={() => copyToClipboard(student.mobileNo)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Password:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {student.password}
                    </span>
                    <button
                      onClick={() => copyToClipboard(student.password)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parent:</span>
                  <span className="font-medium">{student.parentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Parent Mobile:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{student.parentMobileNo}</span>
                    <button
                      onClick={() => copyToClipboard(student.parentMobileNo)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-gray-600 block text-xs">Address:</span>
                  <span className="font-medium text-xs">{student.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedClass ? 'Try adjusting your search filters.' : 'Get started by adding a new student.'}
            </p>
            {!searchTerm && !selectedClass && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Student
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* ⬇️ No UI changes to cards — same as your original */}
        {/* Your student cards code goes here, unchanged */}
        {/* ... */}
      </div>

      {/* Add/Edit Forms */}
      {showForm && (
        <StudentForm
          onSubmit={handleAddStudent}
          onCancel={() => setShowForm(false)}
          isLoading={isSubmitting}
        />
      )}
      {editingStudent && (
        <StudentForm
          student={editingStudent}
          onSubmit={handleEditStudent}
          onCancel={() => setEditingStudent(null)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
