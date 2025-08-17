'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AttendanceRecord {
  _id: string;
  class: string;
  section: string;
  subject: string;
  date: string;
  markedBy: {
    _id: string;
    name: string;
  };
  students: {
    studentId: {
      _id: string;
      name: string;
      rollNo: string;
    };
    status: 'Present' | 'Absent';
    remarks?: string;
  }[];
}

interface AttendanceSummary {
  subject: string;
  class: string;
  section: string;
  totalDays: number;
  attendanceDates: {
    date: string;
    subject: string;
    class: string;
    section: string;
  }[];
}

interface StudentAttendanceDetail {
  studentId: {
    _id: string;
    name: string;
    rollNo: string;
  };
  status: 'Present' | 'Absent';
  remarks?: string;
}

interface StudentDetails {
  _id: string;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  mobileNo: string;
  parentName: string;
  parentMobileNo: string;
  address: string;
}

const AttendancePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  
  // Modal states
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<AttendanceSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceDetail[]>([]);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<StudentDetails | null>(null);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const classes = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];

  useEffect(() => {
    // Initially load current date attendance only
    fetchAttendanceSummary();
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchAttendanceSummary();
    }
  }, [selectedMonth, selectedYear, selectedClass, selectedSection]);

  const fetchAttendanceSummary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Only add month and year if both are selected
      if (selectedMonth && selectedYear) {
        params.append('month', selectedMonth);
        params.append('year', selectedYear);
      }
      
      if (selectedClass) params.append('class', selectedClass);
      if (selectedSection) params.append('section', selectedSection);

      const response = await fetch(`/api/admin/attendance/summary?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAttendanceSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttendance = async (date: string, subject: string, classParam: string, section: string) => {
    try {
      const params = new URLSearchParams({
        date,
        subject,
        class: classParam,
        section,
      });

      const response = await fetch(`/api/admin/attendance?${params}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setStudentAttendance(data.data[0].students);
        setSelectedDate(date);
        setShowStudentModal(true);
      } else {
        // Show empty state in student modal
        setStudentAttendance([]);
        setSelectedDate(date);
        setShowStudentModal(true);
      }
    } catch (error) {
      console.error('Error fetching student attendance:', error);
    }
  };

  const fetchStudentDetails = async (studentId: string) => {
    setLoadingStudentDetails(true);
    try {
      const response = await fetch(`/api/admin/students/${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedStudentDetails(data.data);
        setShowStudentDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoadingStudentDetails(false);
    }
  };

  const openCalendarModal = (subject: AttendanceSummary) => {
    setSelectedSubject(subject);
    // Set default month and year if not selected
    if (!selectedMonth || !selectedYear) {
      const now = new Date();
      setSelectedMonth((now.getMonth() + 1).toString());
      setSelectedYear(now.getFullYear().toString());
    }
    setShowCalendarModal(true);
  };

  const clearFilters = () => {
    setSelectedMonth('');
    setSelectedYear('');
    setSelectedClass('');
    setSelectedSection('');
  };

  const generateCalendarDays = () => {
    // Use current month/year if not selected, or the selected month/year
    const currentDate = new Date();
    const year = selectedYear ? parseInt(selectedYear) : currentDate.getFullYear();
    const month = selectedMonth ? parseInt(selectedMonth) - 1 : currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isAttendanceTaken = (day: number) => {
    if (!selectedSubject || !day) return false;
    
    const year = selectedYear || new Date().getFullYear().toString();
    const month = selectedMonth || (new Date().getMonth() + 1).toString();
    const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    return selectedSubject.attendanceDates.some(
      attendance => new Date(attendance.date).toISOString().split('T')[0] === dateStr
    );
  };

  const handleDateClick = (day: number) => {
    if (!selectedSubject || !day) return;
    
    const year = selectedYear || new Date().getFullYear().toString();
    const month = selectedMonth || (new Date().getMonth() + 1).toString();
    const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Always allow clicking on any date, whether attendance was taken or not
    fetchStudentAttendance(dateStr, selectedSubject.subject, selectedSubject.class, selectedSubject.section);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const makeCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const getCurrentMonthYear = () => {
    const year = selectedYear || new Date().getFullYear().toString();
    const month = selectedMonth || (new Date().getMonth() + 1).toString();
    const monthName = months.find(m => m.value === month)?.label || 'Current';
    return `${monthName} ${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-spin mx-auto" style={{ animationDelay: '0.15s', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading attendance...</p>
          <p className="text-sm text-slate-500 mt-1">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Attendance Management
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedMonth && selectedYear 
                    ? `Viewing ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} attendance`
                    : 'Viewing today\'s attendance records'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Filter Attendance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">Current Date Only</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">Select Year</option>
                {[2024, 2025, 2026, 2027, 2028].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">All Sections</option>
                {sections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">{attendanceSummary.length}</span> subjects found
              {selectedMonth && selectedYear && (
                <span className="ml-2 text-slate-500">
                  for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                </span>
              )}
            </div>
            {(selectedMonth || selectedYear || selectedClass || selectedSection) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Attendance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendanceSummary.map((subject, index) => (
            <div
              key={index}
              onClick={() => openCalendarModal(subject)}
              className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{subject.subject}</h3>
                    <p className="text-sm text-slate-600">
                      Class {subject.class} - Section {subject.section}
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-600">Total Days</span>
                  <span className="text-lg font-bold text-blue-600">{subject.totalDays}</span>
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-2">Click to view calendar</p>
                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {attendanceSummary.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No attendance records found</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {selectedMonth && selectedYear 
                ? `No attendance records found for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}${selectedClass ? ` in class ${selectedClass}` : ''}${selectedSection ? ` section ${selectedSection}` : ''}.`
                : `No attendance records found for today${selectedClass ? ` in class ${selectedClass}` : ''}${selectedSection ? ` section ${selectedSection}` : ''}.`}
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Calendar Modal - Now shows all dates properly */}
      {showCalendarModal && selectedSubject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedSubject.subject}</h2>
                <p className="text-slate-600 mt-1">
                  Class {selectedSubject.class} - Section {selectedSubject.section} | {getCurrentMonthYear()}
                </p>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Attendance Taken</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                    <span className="text-sm text-slate-600">No Attendance</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500">Click on any date to view/check attendance</p>
              </div>

              {/* Enhanced Calendar Grid */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {/* Calendar Header */}
                <div className="bg-slate-50 border-b border-slate-200">
                  <div className="grid grid-cols-7">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <div key={day} className="p-4 text-center">
                        <div className="text-sm font-bold text-slate-700">{day.slice(0, 3)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar Body */}
                <div className="grid grid-cols-7">
                  {generateCalendarDays().map((day, index) => {
                    const isToday = day && new Date().getDate() === day && 
                                   new Date().getMonth() === (parseInt(selectedMonth || (new Date().getMonth() + 1).toString()) - 1) &&
                                   new Date().getFullYear() === parseInt(selectedYear || new Date().getFullYear().toString());
                    const hasAttendance = day && isAttendanceTaken(day);
                    
                    return (
                      <div
                        key={index}
                        onClick={() => day && handleDateClick(day)}
                        className={`
                          aspect-square border-r border-b border-slate-200 flex items-center justify-center text-sm font-medium transition-all duration-200 relative
                          ${!day 
                            ? 'bg-slate-50 cursor-default' 
                            : 'cursor-pointer hover:bg-blue-50'
                          }
                          ${hasAttendance ? 'bg-green-100 hover:bg-green-200' : ''}
                          ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
                        `}
                      >
                        {day && (
                          <>
                            <span className={`
                              ${hasAttendance ? 'text-green-800 font-bold' : 'text-slate-700'}
                              ${isToday ? 'text-blue-600 font-bold' : ''}
                            `}>
                              {day}
                            </span>
                            {hasAttendance && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                            {isToday && (
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Legend */}
              <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border-2 border-blue-500 rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Attendance Taken</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  <span>No Attendance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Attendance Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Student Attendance</h2>
                <p className="text-slate-600 mt-1">
                  {selectedSubject?.subject} | Class {selectedSubject?.class} - Section {selectedSubject?.section} | {new Date(selectedDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowStudentModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {studentAttendance.length > 0 ? (
                <div className="grid gap-4">
                  {studentAttendance.map((student, index) => (
                    <div
                      key={index}
                      onClick={() => fetchStudentDetails(student.studentId._id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                        student.status === 'Present'
                          ? 'bg-green-50 border-green-200 hover:bg-green-100'
                          : 'bg-red-50 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            student.status === 'Present' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {student.studentId.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">{student.studentId.name}</h3>
                            <p className="text-sm text-slate-600">Roll No: {student.studentId.rollNo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            student.status === 'Present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                          {student.remarks && (
                            <p className="text-xs text-slate-500 mt-1">{student.remarks}</p>
                          )}
                          <p className="text-xs text-blue-500 mt-1">Click for details</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No Attendance Record</h3>
                  <p className="text-slate-600 mb-4">
                    No attendance was taken for this date and subject combination.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
                    <p className="text-sm text-blue-700">
                      <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}<br/>
                      <strong>Subject:</strong> {selectedSubject?.subject}<br/>
                      <strong>Class:</strong> {selectedSubject?.class} - Section {selectedSubject?.section}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal - Same as before */}
      {showStudentDetailModal && selectedStudentDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  {selectedStudentDetails.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedStudentDetails.name}</h2>
                  <p className="text-slate-600">Class {selectedStudentDetails.class} - Section {selectedStudentDetails.section}</p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Student Information */}
                <div className="bg-slate-50 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Student Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Roll Number</p>
                      <p className="text-slate-800 font-semibold">{selectedStudentDetails.rollNo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Class & Section</p>
                      <p className="text-slate-800 font-semibold">{selectedStudentDetails.class} - {selectedStudentDetails.section}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Student Mobile</p>
                        <p className="text-slate-800 font-semibold">{selectedStudentDetails.mobileNo}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(selectedStudentDetails.mobileNo)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Copy number"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => makeCall(selectedStudentDetails.mobileNo)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Call student"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="bg-green-50 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Parent Information</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm font-medium text-slate-600">Parent Name</p>
                      <p className="text-slate-800 font-semibold">{selectedStudentDetails.parentName}</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Parent Mobile</p>
                        <p className="text-slate-800 font-semibold">{selectedStudentDetails.parentMobileNo}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(selectedStudentDetails.parentMobileNo)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Copy parent number"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => makeCall(selectedStudentDetails.parentMobileNo)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Call parent"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Address</h3>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-slate-700 leading-relaxed">{selectedStudentDetails.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay for student details */}
      {loadingStudentDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-700">Loading student details...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;