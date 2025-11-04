'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { PlusIcon, TrashIcon, PrinterIcon, MagnifyingGlassIcon, CloudArrowUpIcon, PencilIcon, ShareIcon } from '@heroicons/react/24/outline';

interface LearningPlan {
  component: string;
  details: string;
}

interface Feedback {
  _id?: string;
  feedbackId: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  rollNumber: string;
  issueDate: string;
  feedbackText: string;
  personalizedLearningPlan: LearningPlan[];
  sharedWithParent: boolean;
  sharedAt?: string;
  generatedBy: string;
}

interface Student {
  _id: string;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  mobileNo: string;
  parentName: string;
  parentMobileNo: string;
}

const FeedbackPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [feedbackText, setFeedbackText] = useState('');
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([
    { component: '', details: '' }
  ]);
  const [sharedWithParent, setSharedWithParent] = useState(false);

  // Print mode
  const [showPrintView, setShowPrintView] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);

  // Memoized fetch functions to prevent unnecessary re-renders
  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/admin/students');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setStudents(result.data || []);
        setFilteredStudents(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Error fetching students. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStudentFeedbacks = useCallback(async (studentId: string) => {
    try {
      setError('');
      const response = await fetch(`/api/admin/feedback?studentId=${studentId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setFeedbacks(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Error fetching feedbacks. Please check your connection.');
    }
  }, []);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students based on search criteria
  useEffect(() => {
    try {
      let filtered = students;

      if (classFilter) {
        filtered = filtered.filter(student => student.class === classFilter);
      }

      if (sectionFilter) {
        filtered = filtered.filter(student => student.section === sectionFilter);
      }

      if (searchTerm) {
        filtered = filtered.filter(student =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.mobileNo.includes(searchTerm)
        );
      }

      setFilteredStudents(filtered);
    } catch (error) {
      console.error('Error filtering students:', error);
      setError('Error filtering students');
    }
  }, [students, classFilter, sectionFilter, searchTerm]);

  const handleStudentSelect = useCallback((student: Student) => {
    try {
      setSelectedStudent(student);
      fetchStudentFeedbacks(student._id);

      // Reset form and edit mode
      setIsEditMode(false);
      setEditingFeedback(null);
      setFeedbackText('');
      setLearningPlans([{ component: '', details: '' }]);
      setSharedWithParent(false);
      setError('');
      setSuccess('');
    } catch (error) {
      console.error('Error selecting student:', error);
      setError('Error selecting student');
    }
  }, [fetchStudentFeedbacks]);

  const addLearningPlan = useCallback(() => {
    try {
      setLearningPlans(prev => [...prev, { component: '', details: '' }]);
    } catch (error) {
      console.error('Error adding learning plan:', error);
      setError('Error adding learning plan');
    }
  }, []);

  const removeLearningPlan = useCallback((index: number) => {
    try {
      if (learningPlans.length > 1) {
        setLearningPlans(prev => prev.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error('Error removing learning plan:', error);
      setError('Error removing learning plan');
    }
  }, [learningPlans.length]);

  const updateLearningPlan = useCallback((index: number, field: keyof LearningPlan, value: string) => {
    try {
      setLearningPlans(prev => {
        const newPlans = [...prev];
        newPlans[index] = { ...newPlans[index], [field]: value };
        return newPlans;
      });
    } catch (error) {
      console.error('Error updating learning plan:', error);
      setError('Error updating learning plan');
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      setError('Please select a student first');
      return;
    }

    if (!feedbackText.trim()) {
      setError('Please enter feedback text');
      return;
    }

    if (learningPlans.some(plan => !plan.component.trim() || !plan.details.trim())) {
      setError('Please fill all learning plan components and details');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      let response;

      if (isEditMode && editingFeedback) {
        // Update existing feedback
        response = await fetch('/api/admin/feedback', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingFeedback._id,
            feedbackText,
            personalizedLearningPlan: learningPlans,
            sharedWithParent
          }),
        });
      } else {
        // Create new feedback
        response = await fetch('/api/admin/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: selectedStudent._id,
            feedbackText,
            personalizedLearningPlan: learningPlans,
            sharedWithParent,
            generatedBy: 'admin' // Placeholder - should be admin ID from session
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const successMessage = isEditMode ? 'Feedback updated successfully!' : 'Feedback created successfully!';
        setSuccess(successMessage);
        fetchStudentFeedbacks(selectedStudent._id);

        // Reset form and edit mode
        setIsEditMode(false);
        setEditingFeedback(null);
        setFeedbackText('');
        setLearningPlans([{ component: '', details: '' }]);
        setSharedWithParent(false);
      } else {
        const errorMessage = isEditMode ? 'Failed to update feedback' : 'Failed to create feedback';
        setError(result.error || errorMessage);
      }
    } catch (error) {
      console.error('Error with feedback operation:', error);
      const errorMessage = isEditMode ? 'Error updating feedback' : 'Error creating feedback';
      setError(`${errorMessage}. Please check your connection.`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudent, feedbackText, learningPlans, sharedWithParent, fetchStudentFeedbacks, isEditMode, editingFeedback]);

  const handlePrint = useCallback((feedback: Feedback) => {
    try {
      setSelectedFeedback(feedback);
      setShowPrintView(true);
      setTimeout(() => {
        window.print();
      }, 100);
    } catch (error) {
      console.error('Error printing feedback:', error);
      setError('Error printing feedback');
    }
  }, []);

  const handleEdit = useCallback((feedback: Feedback) => {
    try {
      setIsEditMode(true);
      setEditingFeedback(feedback);

      // Populate form with existing data
      setFeedbackText(feedback.feedbackText);
      setLearningPlans(feedback.personalizedLearningPlan?.length > 0
        ? feedback.personalizedLearningPlan
        : [{ component: '', details: '' }]
      );
      setSharedWithParent(feedback.sharedWithParent);

      setError('');
      setSuccess('');
    } catch (error) {
      console.error('Error editing feedback:', error);
      setError('Error loading feedback for editing');
    }
  }, []);

  const handleCancelEdit = useCallback(() => {
    try {
      setIsEditMode(false);
      setEditingFeedback(null);

      // Reset form
      setFeedbackText('');
      setLearningPlans([{ component: '', details: '' }]);
      setSharedWithParent(false);
      setError('');
      setSuccess('');
    } catch (error) {
      console.error('Error canceling edit:', error);
      setError('Error canceling edit');
    }
  }, []);

  const handleDelete = useCallback(async (feedbackId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
        return;
      }

      setIsLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/admin/feedback?id=${feedbackId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSuccess('Feedback deleted successfully!');
        // Refresh the feedbacks list
        if (selectedStudent) {
          fetchStudentFeedbacks(selectedStudent._id);
        }
      } else {
        setError(result.error || 'Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setError('Error deleting feedback. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudent, fetchStudentFeedbacks]);

  if (showPrintView && selectedFeedback) {
    return (
      <div className="min-h-screen bg-white p-8 print-p-0">
        <button
          onClick={() => setShowPrintView(false)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg print-hidden"
        >
          Back to Edit
        </button>

        <PrintableFeedback feedback={selectedFeedback} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Feedback Management</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Selection Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select Student</h2>

            {/* Filters */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Classes</option>
                  <option value="Nursery">Nursery</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                  <option value="5th">5th</option>
                  <option value="6th">6nd</option>
                  <option value="7th">7rd</option>
                  <option value="8th">8th</option>
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Section</label>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Sections</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Name or Mobile No"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <p className="text-center py-4">Loading students...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No students found</p>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      onClick={() => handleStudentSelect(student)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedStudent?._id === student._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        Class: {student.class}-{student.section} | Roll: {student.rollNo}
                      </div>
                      <div className="text-sm text-gray-500">
                        Mobile: {student.mobileNo}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="lg:col-span-2 bg-white text-stone-600 rounded-lg shadow p-6">
            {selectedStudent ? (
              <>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                      <p className="text-sm text-gray-600">
                        Class: {selectedStudent.class}-{selectedStudent.section} | Roll No: {selectedStudent.rollNo}
                      </p>
                    </div>
                    {isEditMode && (
                      <div className="text-sm text-orange-600 font-medium">
                        Editing: {editingFeedback?.feedbackId}
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feedback Text */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Feedback Text</label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Enter detailed feedback for the student..."
                      className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-vertical"
                      required
                    />
                  </div>

                  {/* Personalized Learning Plan */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Personalized Learning Plan</h3>
                      <button
                        type="button"
                        onClick={addLearningPlan}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add Component
                      </button>
                    </div>

                    <div className="space-y-4">
                      {learningPlans.map((plan, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Component</label>
                              <input
                                type="text"
                                value={plan.component}
                                onChange={(e) => updateLearningPlan(index, 'component', e.target.value)}
                                placeholder="e.g., Mathematics, Reading, Behavior"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Details</label>
                              <input
                                type="text"
                                value={plan.details}
                                onChange={(e) => updateLearningPlan(index, 'details', e.target.value)}
                                placeholder="Specific recommendations or goals"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                              />
                            </div>
                          </div>
                          {learningPlans.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLearningPlan(index)}
                              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Remove Component
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Share with Parent */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="sharedWithParent"
                      checked={sharedWithParent}
                      onChange={(e) => setSharedWithParent(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sharedWithParent" className="text-sm font-medium text-gray-700">
                      Share this feedback with parent
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Feedback' : 'Create Feedback')}
                    </button>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Previous Feedbacks */}
                {feedbacks.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Previous Feedbacks</h3>
                    <div className="space-y-2">
                      {feedbacks.map((feedback) => (
                        <div key={feedback._id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{feedback.feedbackId}</div>
                              <div className="text-sm text-gray-500 mb-2">
                                {new Date(feedback.issueDate).toLocaleDateString()} |
                                {feedback.sharedWithParent ? 'Shared with parent' : 'Not shared with parent'}
                              </div>
                              <div className="text-sm text-gray-700 mb-2">
                                {feedback.feedbackText.length > 100
                                  ? `${feedback.feedbackText.substring(0, 100)}...`
                                  : feedback.feedbackText
                                }
                              </div>
                              {feedback.personalizedLearningPlan && feedback.personalizedLearningPlan.length > 0 && (
                                <div className="text-sm text-blue-600">
                                  Learning Plan: {feedback.personalizedLearningPlan.length} component(s)
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(feedback)}
                                className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                                title="Edit Feedback"
                              >
                                <PencilIcon className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handlePrint(feedback)}
                                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                title="Print Feedback"
                              >
                                <PrinterIcon className="h-4 w-4" />
                                Print
                              </button>
                              <button
                                onClick={() => handleDelete(feedback._id!)}
                                className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                title="Delete Feedback"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">Select a student to create feedback</p>
                <p className="text-sm">Use the filters on the left to find students by class, section, or search by name/mobile number</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Printable Feedback Component
const PrintableFeedback: React.FC<{ feedback: Feedback }> = ({ feedback }) => {
  try {
    return (
      <>
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          `
        }} />
        <div className="max-w-4xl mx-auto bg-white p-8 relative text-black">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
            <Image
              src="/logo.png"
              alt="School Logo"
              width={500}
              height={500}
              className="object-contain"
              onError={(e) => {
                console.error('Logo image failed to load');
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 border-b-2 border-blue-600 pb-4">
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-1">STEP-UP EDUCATION INSTITUTE</h1>
                <p className="text-sm text-gray-600 mb-1">1st To 12th Grade</p>
                <p className="text-sm text-gray-600 mb-1">BSEB and CBSE Based Curriculum</p>
                <p>📞 9262801624</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 mb-4">
              Amber, Shekhana Kalan, Sekhana Kalan, BiharSharif, Bihar 803101
            </div>

            {/* Student Info */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
                STUDENT FEEDBACK REPORT
              </h2>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className="font-semibold">Student Name:</span> {feedback.studentName}
                </div>
                <div>
                  <span className="font-semibold">Class:</span> {feedback.class} ({feedback.section}) | <span className="font-semibold">Roll:</span> {feedback.rollNumber}
                </div>
                <div>
                  <span className="font-semibold">Feedback ID:</span> {feedback.feedbackId}
                </div>
                <div>
                  <span className="font-semibold">Issue Date:</span> {new Date(feedback.issueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-blue-600 mb-3">Feedback</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800 leading-relaxed">{feedback.feedbackText}</p>
              </div>
            </div>

            {/* Personalized Learning Plan */}
            {feedback.personalizedLearningPlan && feedback.personalizedLearningPlan.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Personalized Learning Plan</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Component</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.personalizedLearningPlan.map((plan, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-3 py-2 font-medium">{plan.component}</td>
                          <td className="border border-gray-300 px-3 py-2">{plan.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="h-16 border-b border-gray-400 mb-2"></div>
                <p className="font-semibold">Parent Signature</p>
                <p className="text-sm text-gray-500">If shared with parent</p>
              </div>
              <div className="text-center">
                <div className="h-16 border-b border-gray-400 mb-2 relative">
                  <Image
                    src="/kais.png"
                    alt="Signature"
                    width={120}
                    height={40}
                    className="absolute left-1/2 transform -translate-x-1/2"
                    onError={(e) => {
                      console.error('Signature image failed to load');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <p className="font-semibold">Director&apos;s Signature</p>
              </div>
              <div className="text-center">
                <div className="h-16 border-b border-gray-400 mb-2 relative">
                  <Image
                    src="/kashif.png"
                    alt="Signature"
                    width={120}
                    height={40}
                    className="absolute left-1/2 transform -translate-x-1/2"
                    onError={(e) => {
                      console.error('Signature image failed to load');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <p className="font-semibold">Director&apos;s Signature</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error rendering PrintableFeedback:', error);
    return (
      <div className="max-w-4xl mx-auto bg-white p-8">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Error Loading Feedback</h2>
          <p>There was an error displaying the feedback. Please try again.</p>
        </div>
      </div>
    );
  }
};

export default FeedbackPage;
