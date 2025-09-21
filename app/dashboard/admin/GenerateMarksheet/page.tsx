'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { PlusIcon, TrashIcon, PrinterIcon, MagnifyingGlassIcon, CloudArrowUpIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Subject {
  subject: string;
  fullMarks: number;
  passMarks: number;
  assignmentMarks: number;
  theoryMarks: number;
  obtainedMarks: number;
  grade: string;
  remark: string;
  customSubjectName: string;
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

interface Marksheet {
  _id?: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  examTitle: string;
  examType: string;
  examDate: string;
  subjects: Subject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  division: string;
  rank: string;
}

const GenerateMarksheet = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [examTitle, setExamTitle] = useState('');
  const [customExamTitle, setCustomExamTitle] = useState('');
  const [examType, setExamType] = useState('');
  const [examDate, setExamDate] = useState('');
  const [rank, setRank] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      subject: '',
      fullMarks: 100,
      passMarks: 33,
      assignmentMarks: 0,
      theoryMarks: 0,
      obtainedMarks: 0,
      grade: '',
      remark: '',
      customSubjectName: ''
    }
  ]);

  // Print mode
  const [showPrintView, setShowPrintView] = useState(false);
  const [selectedMarksheet, setSelectedMarksheet] = useState<Marksheet | null>(null);

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMarksheet, setEditingMarksheet] = useState<Marksheet | null>(null);

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

  const fetchStudentMarksheets = useCallback(async (studentId: string) => {
    try {
      setError('');
      const response = await fetch(`/api/admin/marksheets?studentId=${studentId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setMarksheets(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch marksheets');
      }
    } catch (error) {
      console.error('Error fetching marksheets:', error);
      setError('Error fetching marksheets. Please check your connection.');
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
      fetchStudentMarksheets(student._id);

      // Reset form and edit mode
      setIsEditMode(false);
      setEditingMarksheet(null);
      setExamTitle('');
      setExamType('');
      setExamDate('');
      setRank('');
      setSubjects([{
        subject: '',
        fullMarks: 100,
        passMarks: 33,
        assignmentMarks: 0,
        theoryMarks: 0,
        obtainedMarks: 0,
        grade: '',
        remark: '',
        customSubjectName: ''
      }]);
      setError('');
      setSuccess('');
    } catch (error) {
      console.error('Error selecting student:', error);
      setError('Error selecting student');
    }
  }, [fetchStudentMarksheets]);

  const addSubject = useCallback(() => {
    try {
      setSubjects(prev => [...prev, {
        subject: '',
        fullMarks: 100,
        passMarks: 33,
        assignmentMarks: 0,
        theoryMarks: 0,
        obtainedMarks: 0,
        grade: '',
        remark: '',
        customSubjectName: ''
      }]);
    } catch (error) {
      console.error('Error adding subject:', error);
      setError('Error adding subject');
    }
  }, []);

  const removeSubject = useCallback((index: number) => {
    try {
      if (subjects.length > 1) {
        setSubjects(prev => prev.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error('Error removing subject:', error);
      setError('Error removing subject');
    }
  }, [subjects.length]);

  const updateSubject = useCallback((index: number, field: keyof Subject, value: string | number) => {
    try {
      setSubjects(prev => {
        const newSubjects = [...prev];
        newSubjects[index] = { ...newSubjects[index], [field]: value };

        // Clear customSubjectName if subject field changed and is not 'Other'
        if (field === 'subject' && value !== 'Other') {
          newSubjects[index].customSubjectName = '';
        }

        // Calculate grade automatically based on obtained marks
        if (field === 'obtainedMarks' || field === 'fullMarks') {
          const percentage = (newSubjects[index].obtainedMarks / newSubjects[index].fullMarks) * 100;
          if (percentage >= 90) newSubjects[index].grade = 'A+';
          else if (percentage >= 80) newSubjects[index].grade = 'A';
          else if (percentage >= 70) newSubjects[index].grade = 'B+';
          else if (percentage >= 60) newSubjects[index].grade = 'B';
          else if (percentage >= 45) newSubjects[index].grade = 'C';
          else if (percentage >= 10) newSubjects[index].grade = 'D';
          else if (percentage >= 0) newSubjects[index].grade = 'F';
          else newSubjects[index].grade = 'F';
        }

        return newSubjects;
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      setError('Error updating subject');
    }
  }, []);

  // Memoized calculation to prevent unnecessary re-calculations
  const totals = useMemo(() => {
    try {
      const totalMarks = subjects.reduce((sum, subject) => sum + (subject.fullMarks || 0), 0);
      const obtainedMarks = subjects.reduce((sum, subject) => sum + (subject.obtainedMarks || 0), 0);
      const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;

      let grade = 'F';
      let division = '3rd Division';

      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 45) grade = 'C';
      else if (percentage >= 10) grade = 'D';
      else if (percentage >= 0) grade = 'F';




      if (percentage >= 60) division = '1st Division';
      else if (percentage >= 45) division = '2nd Division';
      else if (percentage >= 0) division = '3rd Division';

      return { totalMarks, obtainedMarks, percentage, grade, division };
    } catch (error) {
      console.error('Error calculating totals:', error);
      return { totalMarks: 0, obtainedMarks: 0, percentage: 0, grade: 'C', division: '3rd Division' };
    }
  }, [subjects]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      setError('Please select a student first');
      return;
    }

    if (!examTitle || !examType || !examDate) {
      setError('Please fill all exam details');
      return;
    }

    if (subjects.some(subject => !subject.subject || subject.obtainedMarks < 0)) {
      setError('Please fill all subject details properly');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Process data to replace 'Other' with custom values
      const finalExamTitle = examTitle === 'Other' ? customExamTitle : examTitle;
      const finalSubjects = subjects.map(subject => ({
        ...subject,
        subject: subject.subject === 'Other' ? subject.customSubjectName : subject.subject
      }));

      let response;

      if (isEditMode && editingMarksheet) {
        // Update existing marksheet
        response = await fetch('/api/admin/marksheets', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingMarksheet._id,
            examTitle: finalExamTitle,
            examType,
            examDate,
            subjects: finalSubjects,
            rank,
            principalSignature: '/principal-signature.png',
            classTeacherSignature: '/teacher-signature.png'
          }),
        });
      } else {
        // Create new marksheet
        response = await fetch('/api/admin/marksheets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: selectedStudent._id,
            examTitle: finalExamTitle,
            examType,
            examDate,
            subjects: finalSubjects,
            rank,
            generatedBy: selectedStudent._id, // Using student ID as placeholder - should be admin ID from session
            principalSignature: '/principal-signature.png',
            classTeacherSignature: '/teacher-signature.png'
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const successMessage = isEditMode ? 'Marksheet updated successfully!' : 'Marksheet generated successfully!';
        setSuccess(successMessage);
        fetchStudentMarksheets(selectedStudent._id);

        // Reset form and edit mode
        setIsEditMode(false);
        setEditingMarksheet(null);
        setExamTitle('');
        setExamType('');
        setExamDate('');
        setRank('');
        setSubjects([{
          subject: '',
          fullMarks: 100,
          passMarks: 33,
          assignmentMarks: 0,
          theoryMarks: 0,
          obtainedMarks: 0,
          grade: '',
          remark: '',
          customSubjectName: ''
        }]);
      } else {
        const errorMessage = isEditMode ? 'Failed to update marksheet' : 'Failed to generate marksheet';
        setError(result.error || errorMessage);
      }
    } catch (error) {
      console.error('Error with marksheet operation:', error);
      const errorMessage = isEditMode ? 'Error updating marksheet' : 'Error generating marksheet';
      setError(`${errorMessage}. Please check your connection.`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudent, examTitle, examType, examDate, subjects, rank, fetchStudentMarksheets, isEditMode, editingMarksheet]);

  const handlePrint = useCallback((marksheet: Marksheet) => {
    try {
      setSelectedMarksheet(marksheet);
      setShowPrintView(true);
      setTimeout(() => {
        window.print();
      }, 100);
    } catch (error) {
      console.error('Error printing marksheet:', error);
      setError('Error printing marksheet');
    }
  }, []);

  const handleEdit = useCallback((marksheet: Marksheet) => {
    try {
      setIsEditMode(true);
      setEditingMarksheet(marksheet);

      // Populate form with existing data
      setExamTitle(marksheet.examTitle);
      setExamType(marksheet.examType);
      setExamDate(new Date(marksheet.examDate).toISOString().split('T')[0]);
      setRank(marksheet.rank || '');
      setSubjects(marksheet.subjects?.map(subject => ({
        ...subject,
        customSubjectName: subject.customSubjectName || ''
      })) || [{
        subject: '',
        fullMarks: 100,
        passMarks: 33,
        assignmentMarks: 0,
        theoryMarks: 0,
        obtainedMarks: 0,
        grade: '',
        remark: '',
        customSubjectName: ''
      }]);

      setError('');
      setSuccess('');
    } catch (error) {
      console.error('Error editing marksheet:', error);
      setError('Error loading marksheet for editing');
    }
  }, []);

  const handleCancelEdit = useCallback(() => {
    try {
      setIsEditMode(false);
      setEditingMarksheet(null);

      // Reset form
      setExamTitle('');
      setExamType('');
      setExamDate('');
      setRank('');
      setSubjects([{
        subject: '',
        fullMarks: 100,
        passMarks: 33,
        assignmentMarks: 0,
        theoryMarks: 0,
        obtainedMarks: 0,
        grade: '',
        remark: '',
        customSubjectName: ''
      }]);
      setError('');
      setSuccess('');
    } catch (error) {
      console.error('Error canceling edit:', error);
      setError('Error canceling edit');
    }
  }, []);

  const handleDelete = useCallback(async (marksheetId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this marksheet? This action cannot be undone.')) {
        return;
      }

      setIsLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/admin/marksheets?id=${marksheetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSuccess('Marksheet deleted successfully!');
        // Refresh the marksheets list
        if (selectedStudent) {
          fetchStudentMarksheets(selectedStudent._id);
        }
      } else {
        setError(result.error || 'Failed to delete marksheet');
      }
    } catch (error) {
      console.error('Error deleting marksheet:', error);
      setError('Error deleting marksheet. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudent, fetchStudentMarksheets]);

  if (showPrintView && selectedMarksheet) {
    return (
      <div className="min-h-screen bg-white p-8 print-p-0">
        <button
          onClick={() => setShowPrintView(false)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg print-hidden"
        >
          Back to Edit
        </button>

        <PrintableMarksheet marksheet={selectedMarksheet} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generate Marksheet</h1>

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

          {/* Marksheet Form */}
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
                        Editing: {editingMarksheet?.examTitle}
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Exam Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Exam Title</label>
                      <select
                        value={examTitle}
                        onChange={(e) => {
                          if (e.target.value === 'Other') {
                            setExamTitle('Other');
                            setCustomExamTitle('');
                          } else {
                            setExamTitle(e.target.value);
                            setCustomExamTitle('');
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select Exam Title</option>
                        <option value="1st Week Assessment">1st Week Assessment</option>
                        <option value="2nd week Assessment">2nd Week Assessment</option>
                        <option value="3rd Week Assessment">3rd Week Assessment</option>
                        <option value="4th Week Assessment">4th Week Assessment</option>
                        <option value="Other">Other</option>
                      </select>
                      {examTitle === 'Other' && (
                        <input
                          type="text"
                          value={customExamTitle}
                          onChange={(e) => setCustomExamTitle(e.target.value)}
                          placeholder="Enter custom exam title"
                          className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Exam Type</label>
                      <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Unit Test">Unit Test</option>
                        <option value="Mid Term">Mid Term</option>
                        <option value="Final Term">Final Term</option>
                        <option value="Annual Exam">Annual Exam</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Exam Date</label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Student Rank</label>
                      <input
                        type="text"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        placeholder="e.g., 1st, 2nd, 3rd"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Subjects Table */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Subjects</h3>
                      <button
                        type="button"
                        onClick={addSubject}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add Subject
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-blue-600 text-white">
                            <th className="border border-gray-300 p-2">Subject</th>
                            <th className="border border-gray-300 p-2">Full Marks</th>
                            <th className="border border-gray-300 p-2">Pass Marks</th>
                            <th className="border border-gray-300 p-2">Objective</th>
                            <th className="border border-gray-300 p-2">Theory</th>
                            <th className="border border-gray-300 p-2">Obtained</th>
                            <th className="border border-gray-300 p-2">Grade</th>
                            <th className="border border-gray-300 p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjects.map((subject, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 p-2">
                                <select
                                  value={subject.subject === subject.customSubjectName ? 'Other' : subject.subject}
                                  onChange={(e) => {
                                    if (e.target.value === 'Other') {
                                      updateSubject(index, 'subject', 'Other');
                                      updateSubject(index, 'customSubjectName', subject.customSubjectName || '');
                                    } else {
                                      updateSubject(index, 'subject', e.target.value);
                                      updateSubject(index, 'customSubjectName', '');
                                    }
                                  }}
                                  className="w-full p-1 border rounded"
                                >
                                  <option value="">Select Subject</option>
                                  <option value="Mathematics">Mathematics</option>
                                  <option value="PCMB">PCMB</option>
                                  <option value="PCMB-SST">PCMB-SST</option>
                                  <option value="Urdu">Urdu</option>
                                  <option value="English">English</option>
                                  <option value="Hindi">Hindi</option>
                                  <option value="Science">Science</option>
                                  <option value="Social Science">Social Science</option>
                                  <option value="Physics">Physics</option>
                                  <option value="Chemistry">Chemistry</option>
                                  <option value="Biology">Biology</option>
                                  <option value="Political Science">Political Science</option>
                                  <option value="Economics">Economics</option>
                                  <option value="History">History</option>
                                  <option value="Geography">Geography</option>
                                  <option value="Computer Science">Computer Science</option>
                                  <option value="Physical Education">Physical Education</option>
                                  <option value="Other">Other</option>
                                </select>
                                {subject.subject === 'Other' && (
                                  <input
                                    type="text"
                                    value={subject.customSubjectName}
                                    onChange={(e) => updateSubject(index, 'customSubjectName', e.target.value)}
                                    className="w-full mt-1 p-1 border rounded text-sm"
                                    placeholder="Enter custom subject name"
                                  />
                                )}
                              </td>
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="number"
                                  value={subject.fullMarks}
                                  onChange={(e) => updateSubject(index, 'fullMarks', parseInt(e.target.value) || 0)}
                                  className="w-full p-1 border rounded"
                                  min="0"
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="number"
                                  value={subject.passMarks}
                                  onChange={(e) => updateSubject(index, 'passMarks', parseInt(e.target.value) || 0)}
                                  className="w-full p-1 border rounded"
                                  min="0"
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="number"
                                  value={subject.assignmentMarks}
                                  onChange={(e) => updateSubject(index, 'assignmentMarks', parseInt(e.target.value) || 0)}
                                  className="w-full p-1 border rounded"
                                  min="0"
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="number"
                                  value={subject.theoryMarks}
                                  onChange={(e) => updateSubject(index, 'theoryMarks', parseInt(e.target.value) || 0)}
                                  className="w-full p-1 border rounded"
                                  min="0"
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="number"
                                  value={subject.obtainedMarks}
                                  onChange={(e) => updateSubject(index, 'obtainedMarks', parseInt(e.target.value) || 0)}
                                  className="w-full p-1 border rounded"
                                  min="0"
                                  max={subject.fullMarks}
                                />
                              </td>
                              <td className="border border-gray-300 p-2 text-center">
                                <span className="font-semibold">{subject.grade}</span>
                              </td>
                              <td className="border border-gray-300 p-2 text-center">
                                {subjects.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSubject(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-red-600 text-white font-semibold">
                            <td className="border border-gray-300 p-2">TOTAL</td>
                            <td className="border border-gray-300 p-2 text-center">{totals.totalMarks}</td>
                            <td className="border border-gray-300 p-2"></td>
                            <td className="border border-gray-300 p-2"></td>
                            <td className="border border-gray-300 p-2"></td>
                            <td className="border border-gray-300 p-2 text-center">{totals.obtainedMarks}</td>
                            <td className="border border-gray-300 p-2"></td>
                            <td className="border border-gray-300 p-2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-semibold">Division: </span>
                      <span className="text-lg">{totals.division}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Grade: </span>
                      <span className="text-lg">{totals.grade}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Percentage: </span>
                      <span className="text-lg">{totals.percentage}%</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? (isEditMode ? 'Updating...' : 'Generating...') : (isEditMode ? 'Update Marksheet' : 'Generate Marksheet')}
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

                {/* Previous Marksheets */}
                {marksheets.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Previous Marksheets</h3>
                    <div className="space-y-2">
                      {marksheets.map((marksheet) => (
                        <div key={marksheet._id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{marksheet.examTitle}</div>
                              <div className="text-sm text-gray-500 mb-2">
                                {marksheet.examType} | {new Date(marksheet.examDate).toLocaleDateString()} |
                                {marksheet.percentage}% | {marksheet.grade}
                              </div>
                              {marksheet.rank && (
                                <div className="text-sm text-blue-600">
                                  Rank: {marksheet.rank}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(marksheet)}
                                className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                                title="Edit Marksheet"
                              >
                                <PencilIcon className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handlePrint(marksheet)}
                                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                title="Print Marksheet"
                              >
                                <PrinterIcon className="h-4 w-4" />
                                Print
                              </button>
                              <button
                                onClick={() => handleDelete(marksheet._id!)}
                                className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                title="Delete Marksheet"
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
                <p className="text-lg mb-2">Select a student to generate marksheet</p>
                <p className="text-sm">Use the filters on the left to find students by class, section, or search by name/mobile number</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Printable Marksheet Component with error boundary
const PrintableMarksheet: React.FC<{ marksheet: Marksheet }> = ({ marksheet }) => {
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
            <div className="flex items-center gap-4  border-b-2 border-blue-600 ">
              {/* <Image
              src="/logo.png"
              alt="School Logo"
              width={80}
              height={80}
              className="object-contain"
              onError={(e) => {
                console.error('Header logo failed to load');
                e.currentTarget.style.display = 'none';
              }}
            /> */}
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-1">STEP-UP EDUCATION INSTITUTE</h1>
                <p className="text-sm text-gray-600 mb-1">1st To 12th Grade</p>
                <p className="text-sm text-gray-600 mb-1">BSEB and CBSE Based Curriculum</p>
                <p>📞 9262801624</p>

              </div>

            </div>

            <div className="text-center text-sm text-gray-600 mb-2 ">
              Amber, Shekhana Kalan, Sekhana Kalan, BiharSharif, Bihar 803101
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-4 mb-6">

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-blue-600 mb-2">
                  {marksheet.studentName.toUpperCase()}
                </h2>
                <div className='flex items-center gap-8'>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Class:</span> {marksheet.class} ({marksheet.section})
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Roll Number:</span> {marksheet.rollNumber}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Exam Type:</span> {marksheet.examTitle} ({new Date(marksheet.examDate).toLocaleDateString()})
                  </p>
                </div>
              </div>
            </div>

            {/* Report Card */}
            <div className="mb-6">
              <div className=" text-black text-center py-3  text-xl font-bold mb-0">
                REPORT CARD
              </div>

              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-gray-300 p-2">SUBJECT</th>
                    <th className="border border-gray-300 p-2">FULL MARKS</th>
                    <th className="border border-gray-300 p-2">PASS MARKS</th>
                    <th className="border border-gray-300 p-2">ASSIGNMENT</th>
                    <th className="border border-gray-300 p-2">THEORY</th>
                    <th className="border border-gray-300 p-2">MARKS OBTAINED</th>
                    <th className="border border-gray-300 p-2">GRADE</th>
                  </tr>
                </thead>
                <tbody>
                  {marksheet.subjects.map((subject, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2 font-semibold uppercase">
                        {subject.subject === 'Other' ? subject.customSubjectName : subject.subject}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">{subject.fullMarks}</td>
                      <td className="border border-gray-300 p-2 text-center">{subject.passMarks}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        {subject.assignmentMarks > 0 ? subject.assignmentMarks : '-'}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {subject.theoryMarks > 0 ? subject.theoryMarks : subject.obtainedMarks}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">{subject.obtainedMarks}</td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">{subject.grade}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-red-600 text-white font-bold">
                    <td className="border border-gray-300 p-2">TOTAL</td>
                    <td className="border border-gray-300 p-2 text-center">{marksheet.totalMarks}</td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2"></td>
                    <td className="border border-gray-300 p-2 text-center">{marksheet.obtainedMarks}</td>
                    <td className="border border-gray-300 p-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary */}
            <div className="mb-8 space-y-2 flex items-center justify-around">
              <p className="text-lg">
                <span className="font-bold">Division:</span> {marksheet.division}
              </p>
              <p className="text-lg">
                <span className="font-bold">Grade:</span> {marksheet.grade}
              </p>
              <p className="text-lg">
                <span className="font-bold">Percentage:</span> {marksheet.percentage}%
              </p>
              {marksheet.rank && (
                <p className="text-lg">
                  <span className="font-bold">Rank:</span> {marksheet.rank}
                </p>
              )}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="h-16 border-b border-gray-400 mb-2"></div>
                <p className="font-semibold">Parent Signature</p>
              </div>
              <div className="text-center">
                <div className="h-16 border-b border-gray-400 mb-2 relative">
                  {/* Sample signature */}
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
                  {/* Sample signature */}
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
    console.error('Error rendering PrintableMarksheet:', error);
    return (
      <div className="max-w-4xl mx-auto bg-white p-8">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Error Loading Marksheet</h2>
          <p>There was an error displaying the marksheet. Please try again.</p>
        </div>
      </div>
    );
  }
};

export default GenerateMarksheet;