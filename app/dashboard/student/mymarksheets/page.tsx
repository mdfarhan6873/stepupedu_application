'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  PrinterIcon, 
  DownloadIcon, 
  CalendarIcon, 
  BookOpenIcon,
  TrophyIcon,
  GraduationCapIcon,
  FileTextIcon,
  LoaderIcon
} from 'lucide-react';

interface Subject {
  subject: string;
  fullMarks: number;
  passMarks: number;
  assignmentMarks: number;
  theoryMarks: number;
  obtainedMarks: number;
  grade: string;
  remark: string;
}

interface Marksheet {
  _id: string;
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
  schoolName: string;
  schoolLogo: string;
  schoolAddress: string;
  schoolPhone: string;
  generatedDate: string;
}

const MyMarksheets = () => {
  const { data: session, status } = useSession();
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarksheet, setSelectedMarksheet] = useState<Marksheet | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMarksheets();
    }
  }, [status]);

  const fetchMarksheets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students/marksheets');
      const data = await response.json();
      
      if (data.success) {
        setMarksheets(data.data);
      } else {
        setError(data.error || 'Failed to fetch marksheets');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching marksheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (marksheet: Marksheet) => {
    setSelectedMarksheet(marksheet);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getGradeColor = (grade: string) => {
    switch (grade.toLowerCase()) {
      case 'diamond': return 'text-purple-600 bg-purple-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'bronze': return 'text-orange-600 bg-orange-100';
      case 'iron': return 'text-blue-600 bg-blue-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const getDivisionColor = (division: string) => {
    if (division.includes('1st')) return 'text-green-600 bg-green-100';
    if (division.includes('2nd')) return 'text-blue-600 bg-blue-100';
    if (division.includes('3rd')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your marksheets...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <GraduationCapIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please log in to view your marksheets</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileTextIcon className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMarksheets}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-marksheet, .printable-marksheet * {
            visibility: visible;
          }
          .printable-marksheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="mb-8 no-print">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Marksheets</h1>
        <p className="text-gray-600">View and print your academic performance reports</p>
      </div>

      {/* Marksheets List */}
      {marksheets.length === 0 ? (
        <div className="text-center py-12 no-print">
          <FileTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Marksheets Found</h3>
          <p className="text-gray-600">Your marksheets will appear here once they are generated by your school.</p>
        </div>
      ) : (
        <div className="grid gap-6 no-print">
          {marksheets.map((marksheet) => (
            <div key={marksheet._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {marksheet.examTitle}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {new Date(marksheet.examDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <BookOpenIcon className="w-4 h-4 mr-1" />
                        {marksheet.examType}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePrint(marksheet)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    Print
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{marksheet.percentage}%</div>
                    <div className="text-sm text-gray-600">Percentage</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">{marksheet.obtainedMarks}/{marksheet.totalMarks}</div>
                    <div className="text-sm text-gray-600">Marks</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getGradeColor(marksheet.grade)}`}>
                      {marksheet.grade}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Grade</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getDivisionColor(marksheet.division)}`}>
                      {marksheet.division}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Division</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Subject Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {marksheet.subjects.map((subject, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                        <span className="text-sm text-gray-600">
                          {subject.obtainedMarks}/{subject.fullMarks}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Marksheet */}
      {selectedMarksheet && (
        <div className="printable-marksheet hidden print:block">
          <div className="max-w-4xl mx-auto bg-white p-8 relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <img
                src="/logo.png"
                alt="School Logo"
                width={400}
                height={400}
                className="object-contain"
                onError={(e) => {
                  console.error('Logo image failed to load');
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            
            {/* Header */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6 border-b-2 border-blue-600 pb-4">
                <img
                  src="/logo.png"
                  alt="School Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  onError={(e) => {
                    console.error('Header logo failed to load');
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 text-center">
                  <h1 className="text-3xl font-bold text-red-600 mb-1">STEP-UP EDUCATION INSTITUTE</h1>
                  <p className="text-sm text-gray-600 mb-1">1st To 12th Grade</p>
                  <p className="text-sm text-gray-600 mb-1">BSEB and CBSE bassed Curriculum</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>📞 9262801624</p>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600 mb-6">
                Amber, Shekhana Kalan, Sekhana Kala, BiharSharif, Bihar 803101
              </div>
              
              {/* Student Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {selectedMarksheet.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-blue-600 mb-2">
                    {selectedMarksheet.studentName.toUpperCase()}
                  </h2>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Class:</span> {selectedMarksheet.class} ({selectedMarksheet.section})
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Roll Number:</span> {selectedMarksheet.rollNumber}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Exam Type:</span> {selectedMarksheet.examTitle} ({new Date(selectedMarksheet.examDate).toLocaleDateString()})
                  </p>
                </div>
              </div>
              
              {/* Report Card */}
              <div className="mb-6">
                <div className="bg-blue-600 text-white text-center py-3 text-xl font-bold mb-0">
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
                    {selectedMarksheet.subjects.map((subject, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2 font-semibold uppercase">{subject.subject}</td>
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
                      <td className="border border-gray-300 p-2 text-center">{selectedMarksheet.totalMarks}</td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2 text-center">{selectedMarksheet.obtainedMarks}</td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Summary */}
              <div className="mb-8 space-y-2">
                <p className="text-lg">
                  <span className="font-bold">Division:</span> {selectedMarksheet.division}
                </p>
                <p className="text-lg">
                  <span className="font-bold">Grade:</span> {selectedMarksheet.grade}
                </p>
                <p className="text-lg">
                  <span className="font-bold">Percentage:</span> {selectedMarksheet.percentage}%
                </p>
                {selectedMarksheet.rank && (
                  <p className="text-lg">
                    <span className="font-bold">Rank:</span> {selectedMarksheet.rank}
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
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-blue-600 font-cursive text-xl">
                      Teacher
                    </div>
                  </div>
                  <p className="font-semibold">Class Teacher Signature</p>
                </div>
                <div className="text-center">
                  <div className="h-16 border-b border-gray-400 mb-2 relative">
                    {/* Sample signature */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-green-600 font-cursive text-xl">
                      Principal
                    </div>
                  </div>
                  <p className="font-semibold">Principal Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMarksheets;