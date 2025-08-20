"use client";
import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Teacher {
  _id: string;
  name: string;
  mobileNo: string;
  subjects: Array<{
    subjectName: string;
    classes: string[];
  }>;
}

interface AttendanceRecord {
  _id: string;
  teacherId: Teacher;
  date: string;
  isFullDay: boolean;
  subjects: Array<{
    class: string;
    section: string;
    subjectName: string;
    status: 'Present' | 'Absent' | 'Leave';
  }>;
}

interface TeacherStats {
  teacher: Teacher;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  totalSubjects: number;
  presentSubjects: number;
  records: AttendanceRecord[];
}

const TeacherAttendance = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState<{
    records: AttendanceRecord[];
    stats: TeacherStats[];
  }>({ records: [], stats: [] });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetchAttendanceData();
    }
  }, [selectedTeacher, selectedMonth, selectedYear]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers');
      const data = await response.json();
      if (data.success) {
        setTeachers(data.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchAttendanceData = async () => {
    if (!selectedTeacher) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/teacher-attendance?teacherId=${selectedTeacher}&month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await response.json();
      if (data.success) {
        setAttendanceData(data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getAttendanceForDate = (date: number) => {
    const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    return attendanceData.records.find(record =>
      record.date.startsWith(dateStr)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-500';
      case 'Absent': return 'bg-red-500';
      case 'Leave': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircleIcon className="h-4 w-4 text-white" />;
      case 'Absent': return <XCircleIcon className="h-4 w-4 text-white" />;
      case 'Leave': return <ClockIcon className="h-4 w-4 text-white" />;
      default: return null;
    }
  };

  const handleDateClick = (date: number) => {
    const attendance = getAttendanceForDate(date);
    // Show modal for subject-wise attendance (not day-wise) or any attendance with subjects
    if (attendance && (!attendance.isFullDay || attendance.subjects.length > 0)) {
      setSelectedDate(`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`);
      setShowSubjectModal(true);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const attendance = getAttendanceForDate(date);
      const hasAttendance = !!attendance;

      let status = 'No Data';
      let bgColor = 'bg-gray-100';

      if (hasAttendance) {
        if (attendance.isFullDay) {
          // Day-wise attendance - if attendance record exists, teacher was present
          // Check if there are any leave entries
          const hasLeave = attendance.subjects.some(s => s.status === 'Leave');

          if (hasLeave) {
            status = 'Leave';
            bgColor = 'bg-yellow-500';
          } else {
            // If attendance record exists for full day, teacher was present
            status = 'Present';
            bgColor = 'bg-green-500';
          }
        } else {
          // Subject-wise attendance - if teacher added subjects and marked attendance, they were present
          const presentCount = attendance.subjects.filter(s => s.status === 'Present').length;
          const absentCount = attendance.subjects.filter(s => s.status === 'Absent').length;
          const leaveCount = attendance.subjects.filter(s => s.status === 'Leave').length;
          const totalCount = attendance.subjects.length;

          // If attendance record exists with subjects, teacher was present that day
          if (leaveCount === totalCount) {
            // All subjects marked as leave
            status = 'Leave';
            bgColor = 'bg-yellow-500';
          } else if (presentCount > 0) {
            // Teacher taught at least one subject - they were present
            if (presentCount === totalCount) {
              status = 'Present';
              bgColor = 'bg-green-500';
            } else {
              status = 'Partial';
              bgColor = 'bg-orange-500';
            }
          } else if (totalCount > 0) {
            // Has subjects but none marked as present (could be absent or leave)
            status = 'Present'; // Still present since they added attendance
            bgColor = 'bg-green-500';
          }
        }
      }

      const isClickable = hasAttendance && (!attendance?.isFullDay || attendance?.subjects.length > 0);

      days.push(
        <div
          key={date}
          onClick={() => handleDateClick(date)}
          className={`h-12 flex items-center justify-center rounded-lg transition-all ${bgColor} ${hasAttendance ? 'text-white' : 'text-gray-600'
            } ${isClickable ? 'cursor-pointer hover:opacity-80 ring-2 ring-blue-300' : hasAttendance ? 'cursor-default' : 'cursor-default hover:bg-gray-200'}`}
        >
          <div className="text-center">
            <div className="text-sm font-medium">{date}</div>
            {hasAttendance && (
              <div className="flex justify-center mt-1">
                {getStatusIcon(status)}
              </div>
            )}
            {isClickable && (
              <div className="text-xs text-blue-200 mt-1">Click</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedTeacherData = teachers.find(t => t._id === selectedTeacher);
  const currentStats = attendanceData.stats.find(s => s.teacher._id === selectedTeacher);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href='/dashboard/admin'>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Teacher Att.</h1>
              <p className="text-sm text-gray-500">View attendance records</p>
            </div>
          </div>
          <AcademicCapIcon className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Filters</h2>

          {/* Teacher Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Teacher
            </label>
            <div className="relative">
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} - {teacher.mobileNo}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Month/Year Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Info & Stats */}
        {selectedTeacherData && currentStats && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{selectedTeacherData.name}</h3>
                <p className="text-sm text-gray-500">{selectedTeacherData.mobileNo}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{currentStats.presentDays}</div>
                <div className="text-sm text-green-700">Present Days</div>
              </div>
              {currentStats.totalSubjects > 0 && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {currentStats.presentSubjects}/{currentStats.totalSubjects}
                  </div>
                  <div className="text-sm text-blue-700">Subjects Attended</div>
                </div>
              )}
            </div>


          </div>
        )}

        {/* Calendar */}
        {selectedTeacher && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                {months[selectedMonth - 1]} {selectedYear}
              </h3>
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Leave</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span>Partial</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-100 rounded border"></div>
                    <span>No Data</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Subject Modal */}
      {showSubjectModal && selectedDate && (
        <div className="fixed inset-0 backdrop-blur-xs  bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-3 border-b-fuchsia-700 border-r-blue-700 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b bg-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Subject-wise Attendance</h3>
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {attendanceData.records
                .filter(record => record.date.startsWith(selectedDate))
                .map(record => (
                  <div key={record._id} className="space-y-3">
                    {record.subjects.length > 0 ? (
                      record.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-base">{subject.subjectName}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="inline-flex items-center">
                                <AcademicCapIcon className="h-4 w-4 mr-1" />
                                Class {subject.class} - Section {subject.section}
                              </span>
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${subject.status === 'Present' ? 'bg-green-100 text-green-800 border border-green-200' :
                            subject.status === 'Absent' ? 'bg-red-100 text-red-800 border border-red-200' :
                              'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                            {subject.status}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AcademicCapIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No subjects found for this date</p>
                      </div>
                    )}
                  </div>
                ))}

              {attendanceData.records.filter(record => record.date.startsWith(selectedDate)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No attendance data found for this date</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowSubjectModal(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;