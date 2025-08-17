"use client";

import React from 'react';
import { X, Calendar, BookOpen, User, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

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

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  records: AttendanceRecord[];
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  date,
  records
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const presentCount = records.filter(record => record.status === 'Present').length;
  const absentCount = records.filter(record => record.status === 'Absent').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Attendance Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              {formatDate(date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{records.length}</div>
              <div className="text-sm text-gray-600">Total Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-sm text-gray-600">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subject-wise Attendance</h3>
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record._id}
                className={`border rounded-lg p-4 ${
                  record.status === 'Present'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{record.subject}</span>
                      <div className="flex items-center space-x-1">
                        {record.status === 'Present' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            record.status === 'Present' ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>Marked by: {record.markedBy.name}</span>
                      </div>
                    </div>

                    {record.remarks && (
                      <div className="mt-2 flex items-start space-x-1">
                        <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5" />
                        <span className="text-sm text-gray-600">{record.remarks}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;