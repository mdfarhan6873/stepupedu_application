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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-spin mx-auto" style={{ animationDelay: '0.15s', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading students...</p>
          <p className="text-sm text-slate-500 mt-1">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-stone-600 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Student
                </h1>
                <p className="text-sm text-slate-500 mt-1">Manage</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filters */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Search Students
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, roll number, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Filter by Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">All Classes</option>
                {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Filter by Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
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
          
          {/* Results Summary */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">{filteredStudents.length}</span> students found
              {(searchTerm || selectedClass || selectedSection) && (
                <span className="ml-2 text-slate-500">
                  (filtered from {students.length} total)
                </span>
              )}
            </div>
            {(searchTerm || selectedClass || selectedSection) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedClass("");
                  setSelectedSection("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student._id} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{student.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {student.class}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Section {student.section}
                    </span>
                  </div>
                </div>
                {/* Always visible action buttons for mobile */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingStudent(student)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 bg-blue-50/50"
                    title="Edit student"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student._id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 bg-red-50/50"
                    title="Delete student"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Roll Number</span>
                  <span className="text-sm font-bold text-slate-800">{student.rollNo}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Mobile</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-slate-800">{student.mobileNo}</span>
                    <button
                      onClick={() => copyToClipboard(student.mobileNo)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                      title="Copy mobile number"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Password</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                      {student.password}
                    </span>
                    <button
                      onClick={() => copyToClipboard(student.password)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                      title="Copy password"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Parent</span>
                  <span className="text-sm font-semibold text-slate-800">{student.parentName}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Parent Mobile</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-slate-800">{student.parentMobileNo}</span>
                    <button
                      onClick={() => copyToClipboard(student.parentMobileNo)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                      title="Copy parent mobile"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-sm font-medium text-slate-600 block mb-2">Address</span>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">
                    {student.address}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No students found</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchTerm || selectedClass || selectedSection 
                ? 'Try adjusting your search filters to find more students.' 
                : 'Get started by adding your first student to the system.'}
            </p>
            {!searchTerm && !selectedClass && !selectedSection && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
              >
                Add Your First Student
              </button>
            )}
          </div>
        )}
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