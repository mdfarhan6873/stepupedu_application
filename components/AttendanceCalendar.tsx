"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  date: string;
  subject: string;
  class: string;
  section: string;
  status: 'Present' | 'Absent';
  remarks: string;
  markedBy: {
    name: string;
  };
}

interface AttendanceCalendarProps {
  attendanceByDate: { [key: string]: AttendanceRecord[] };
  dailyStatus: { [key: string]: string };
  selectedMonth: number;
  selectedYear: number;
  onDateClick: (date: string, records: AttendanceRecord[]) => void;
  onMonthChange: (month: number, year: number) => void;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  attendanceByDate,
  dailyStatus,
  selectedMonth,
  selectedYear,
  onDateClick,
  onMonthChange
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onMonthChange(12, selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onMonthChange(1, selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1, selectedYear);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 border border-gray-200"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = dailyStatus[dateKey];
      const records = attendanceByDate[dateKey] || [];
      const hasAttendance = records.length > 0;

      let bgColor = 'bg-white hover:bg-gray-50';
      let textColor = 'text-gray-900';
      let borderColor = 'border-gray-200';

      if (hasAttendance) {
        if (status === 'Present') {
          bgColor = 'bg-green-100 hover:bg-green-200';
          textColor = 'text-green-800';
          borderColor = 'border-green-300';
        } else {
          bgColor = 'bg-red-100 hover:bg-red-200';
          textColor = 'text-red-800';
          borderColor = 'border-red-300';
        }
      }

      days.push(
        <div
          key={day}
          className={`h-12 border ${borderColor} ${bgColor} ${textColor} flex items-center justify-center cursor-pointer transition-colors relative`}
          onClick={() => hasAttendance && onDateClick(dateKey, records)}
        >
          <span className="text-sm font-medium">{day}</span>
          {hasAttendance && (
            <div className="absolute bottom-1 right-1">
              <div className={`w-2 h-2 rounded-full ${
                status === 'Present' ? 'bg-green-600' : 'bg-red-600'
              }`}></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[selectedMonth - 1]} {selectedYear}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="h-10 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-600">Present</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-600">Absent</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
          <span className="text-gray-600">No Record</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;