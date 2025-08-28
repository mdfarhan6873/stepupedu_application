"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TeacherForm from "@/components/forms/TeacherForm";

interface Subject {
  subjectName: string;
  classes: string[];
}

interface Teacher {
  _id: string;
  name: string;
  mobileNo: string;
  password: string;
  subjects: Subject[];
  address: string;
  createdAt: string;
}

export default function TeachersManagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user.role !== "admin") {
      router.push("/login");
      return;
    }

    fetchTeachers();
  }, [session, status, router]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers/passwords');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
    setLoading(false);
  };

  const handleAddTeacher = async (teacherData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });

      if (response.ok) {
        fetchTeachers();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add teacher');
      }
    } catch (error) {
      alert('An error occurred while adding the teacher');
    }
    setIsSubmitting(false);
  };

  const handleEditTeacher = async (teacherData: any) => {
    if (!editingTeacher) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/teachers/${editingTeacher._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData),
      });

      if (response.ok) {
        fetchTeachers();
        setEditingTeacher(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update teacher');
      }
    } catch (error) {
      alert('An error occurred while updating the teacher');
    }
    setIsSubmitting(false);
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTeachers();
      } else {
        alert('Failed to delete teacher');
      }
    } catch (error) {
      alert('An error occurred while deleting the teacher');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Get all unique subjects for filtering
  const allSubjects = Array.from(new Set(
    teachers.flatMap(teacher => teacher.subjects.map(sub => sub.subjectName))
  ));

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.mobileNo.includes(searchTerm);
    const matchesSubject = selectedSubject === "" || 
                          teacher.subjects.some(sub => sub.subjectName.toLowerCase().includes(selectedSubject.toLowerCase()));
    return matchesSearch && matchesSubject;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading teachers...</p>
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
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Manage Teachers</h1>
               
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Teachers
              </label>
              <input
                type="text"
                placeholder="Search by name or mobile number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Subjects</option>
                {allSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                  <p className="text-sm text-gray-500">Teacher</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingTeacher(teacher)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(teacher._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mobile:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{teacher.mobileNo}</span>
                    <button
                      onClick={() => copyToClipboard(teacher.mobileNo)}
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
                      {teacher.password}
                    </span>
                    <button
                      onClick={() => copyToClipboard(teacher.password)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Subjects */}
                <div className="pt-2 border-t">
                  <span className="text-gray-600 block text-xs mb-2">Subjects & Classes:</span>
                  {teacher.subjects.length > 0 ? (
                    <div className="space-y-1">
                      {teacher.subjects.map((subject, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                          <div className="font-medium text-gray-900">{subject.subjectName}</div>
                          <div className="text-gray-600 text-xs">
                            Classes: {subject.classes.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs">No subjects assigned</span>
                  )}
                </div>
                
                <div className="pt-2 border-t">
                  <span className="text-gray-600 block text-xs">Address:</span>
                  <span className="font-medium text-xs">{teacher.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedSubject ? 'Try adjusting your search filters.' : 'Get started by adding a new teacher.'}
            </p>
            {!searchTerm && !selectedSubject && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Teacher
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Teacher Form */}
      {showForm && (
        <TeacherForm
          onSubmit={handleAddTeacher}
          onCancel={() => setShowForm(false)}
          isLoading={isSubmitting}
        />
      )}

      {/* Edit Teacher Form */}
      {editingTeacher && (
        <TeacherForm
          teacher={editingTeacher}
          onSubmit={handleEditTeacher}
          onCancel={() => setEditingTeacher(null)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
