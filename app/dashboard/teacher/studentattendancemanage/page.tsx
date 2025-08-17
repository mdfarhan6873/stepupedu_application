'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Student = {
    _id: string;
    name: string;
    rollNo: string;
    mobileNo: string;
};

type StudentRow = {
    _id: string;
    name: string;
    rollNo: string;
    mobileNo: string;
    status: 'Present' | 'Absent';
    remarks?: string;
};

export default function AttendancePage() {
    const router = useRouter();

    // Filters
    const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
    const [klass, setKlass] = useState<string>('');
    const [section, setSection] = useState<string>('');
    const [subject, setSubject] = useState<string>('');

    // Options
    const [classes, setClasses] = useState<string[]>([]);
    const [sections, setSections] = useState<string[]>([]);
    const [loadingClasses, setLoadingClasses] = useState<boolean>(true);
    const [loadingSections, setLoadingSections] = useState<boolean>(false);

    // Data
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
    const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false);

    // Modals
    const [remarkOpenFor, setRemarkOpenFor] = useState<StudentRow | null>(null);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

    // Load classes on mount
    useEffect(() => {
        (async () => {
            setLoadingClasses(true);
            try {
                const res = await fetch('/api/classes');
                if (res.ok) {
                    const data = await res.json();
                    setClasses(data.classes || []);
                }
            } catch (error) {
                console.error('Error loading classes:', error);
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, []);

    // Load sections when class changes
    useEffect(() => {
        setSection('');
        if (!klass) {
            setSections([]);
            return;
        }
        (async () => {
            setLoadingSections(true);
            try {
                const res = await fetch(`/api/sections?class=${encodeURIComponent(klass)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSections(data.sections || []);
                }
            } catch (error) {
                console.error('Error loading sections:', error);
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [klass]);

    // Load students when class & section selected
    useEffect(() => {
        (async () => {
            setStudents([]);
            if (!klass || !section) return;
            setLoadingStudents(true);
            try {
                const res = await fetch(`/api/students?class=${encodeURIComponent(klass)}&section=${encodeURIComponent(section)}`);
                const data = await res.json();
                const base: Student[] = data.students || [];
                // Sort students by roll number
                const sortedStudents = base.sort((a, b) => {
                    const rollA = parseInt(a.rollNo) || 0;
                    const rollB = parseInt(b.rollNo) || 0;
                    return rollA - rollB;
                });
                // default Present
                const rows: StudentRow[] = sortedStudents.map((s) => ({
                    _id: s._id,
                    name: s.name,
                    rollNo: s.rollNo,
                    mobileNo: s.mobileNo,
                    status: 'Present',
                    remarks: '',
                }));
                setStudents(rows);
            } catch (error) {
                console.error('Error loading students:', error);
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [klass, section]);

    // Load existing attendance to prefill (if any)
    useEffect(() => {
        (async () => {
            if (!klass || !section || !subject || !date) return;
            setLoadingAttendance(true);
            try {
                const res = await fetch(
                    `/api/attendance?class=${encodeURIComponent(klass)}&section=${encodeURIComponent(section)}&subject=${encodeURIComponent(subject)}&date=${encodeURIComponent(date)}`
                );
                if (!res.ok) return;
                const data = await res.json();
                if (data.attendance && Array.isArray(data.attendance.students) && data.attendance.students.length && students.length) {
                    const map = new Map<string, { status: 'Present' | 'Absent'; remarks?: string }>();
                    for (const s of data.attendance.students) {
                        map.set(String(s.studentId), { status: s.status, remarks: s.remarks || '' });
                    }
                    setStudents((prev) =>
                        prev.map((p) => {
                            const m = map.get(p._id);
                            return m ? { ...p, status: m.status, remarks: m.remarks || '' } : p;
                        })
                    );
                }
            } catch (error) {
                console.error('Error loading existing attendance:', error);
            } finally {
                setLoadingAttendance(false);
            }
        })();
        // only when student list ready
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [klass, section, subject, date, students.length]);

    const presentCount = useMemo(
        () => students.filter((s) => s.status === 'Present').length,
        [students]
    );
    const absentCount = useMemo(
        () => students.filter((s) => s.status === 'Absent').length,
        [students]
    );

    function toggleStatus(id: string) {
        setStudents((prev) =>
            prev.map((s) => (s._id === id ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s))
        );
    }

    function openRemark(row: StudentRow) {
        setRemarkOpenFor(row);
    }

    function updateRemark(text: string) {
        if (!remarkOpenFor) return;
        // Update both states so UI stays in sync
        setRemarkOpenFor({ ...remarkOpenFor, remarks: text });
        setStudents((prev) =>
            prev.map((s) =>
                s._id === remarkOpenFor._id ? { ...s, remarks: text } : s
            )
        );
    }

    async function handleSave() {
        if (!klass || !section || !subject || !date) {
            alert('Please choose date, class, section and subject');
            return;
        }
        setConfirmOpen(true);
    }

    async function confirmSave() {
        try {
            const payload = {
                class: klass,
                section,
                subject,
                date,
                students: students.map((s) => ({
                    studentId: s._id,
                    status: s.status,
                    remarks: s.remarks || '',
                })),
            };
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to save');
            }
            setConfirmOpen(false);
            alert('Attendance saved successfully!');
            router.push('/dashboard/teacher');
        } catch (e: any) {
            alert(e.message || 'Save failed');
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // You could add a toast notification here
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
                                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    Attendance
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">Mark Attendance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Filters */}
                <div className="mb-8 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Attendance Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Date *</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Class *</label>
                            <select
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                                value={klass}
                                onChange={(e) => setKlass(e.target.value)}
                                disabled={loadingClasses}
                            >
                                <option value="">
                                    {loadingClasses ? 'Loading classes...' : 'Select class'}
                                </option>
                                {classes.map((c) => (
                                    <option key={c} value={c}>
                                        Class {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Section *</label>
                            <select
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                disabled={!klass || loadingSections}
                            >
                                <option value="">
                                    {loadingSections ? 'Loading sections...' : 'Select section'}
                                </option>
                                {sections.map((s) => (
                                    <option key={s} value={s}>
                                        Section {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Subject *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                                placeholder="e.g. Mathematics, Science"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Status Summary */}
                    {students.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-slate-700">
                                        Present: <span className="font-bold text-green-600">{presentCount}</span>
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-slate-700">
                                        Absent: <span className="font-bold text-red-600">{absentCount}</span>
                                    </span>
                                </div>
                                <div className="text-sm text-slate-600">
                                    Total: <span className="font-bold">{students.length}</span>
                                </div>
                            </div>
                            {loadingAttendance && (
                                <div className="text-sm text-blue-600 flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                                    Loading existing attendance...
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Enhanced Students Table */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    {loadingStudents ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">Loading students...</p>
                            </div>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">No students found</h3>
                            <p className="text-slate-600">
                                {!klass || !section 
                                    ? 'Please select class and section to view students'
                                    : 'No students found for the selected class and section'
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-slate-50/80 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-2 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Roll No</th>
                                            <th className="px-2 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Student Name</th>
                                            <th className="px-2 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                                            <th className="px-2 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-slate-200">
                                        {students.map((s) => (
                                            <tr key={s._id} className="hover:bg-white/80 transition-colors duration-200">
                                                <td className="px-2 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-slate-900">{s.rollNo}</div>
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                                                    <div className="text-sm text-slate-500">{s.mobileNo}</div>
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleStatus(s._id)}
                                                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                                                            s.status === 'Present'
                                                                ? 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full mr-2 ${
                                                            s.status === 'Present' ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></div>
                                                        {s.status}
                                                    </button>
                                                </td>
                                                <td className="px-2 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => openRemark(s)}
                                                        className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 hover:scale-105"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        {s.remarks ? 'Edit Remark' : 'Add Remark'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Enhanced Footer */}
                            <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 border-t border-slate-200">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center space-x-6 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="font-medium text-slate-700">
                                                Present: <span className="font-bold text-green-600">{presentCount}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="font-medium text-slate-700">
                                                Absent: <span className="font-bold text-red-600">{absentCount}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={!klass || !section || !subject || !date}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        Save Attendance
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Enhanced Remark Modal */}
            {remarkOpenFor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">Student Remark</h3>
                            <p className="text-slate-600 mt-1">Add or edit remark for {remarkOpenFor.name}</p>
                        </div>
                        
                        <div className="p-6">
                            <div className="bg-slate-50 p-4 rounded-xl mb-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-slate-600">Roll No:</span>
                                        <span className="ml-2 font-bold text-slate-800">{remarkOpenFor.rollNo}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-600">Status:</span>
                                        <span className={`ml-2 font-bold ${
                                            remarkOpenFor.status === 'Present' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {remarkOpenFor.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <div>
                                        <span className="font-medium text-slate-600">Mobile:</span>
                                        <a 
                                            href={`tel:${remarkOpenFor.mobileNo}`}
                                            className="ml-2 text-blue-600 hover:text-blue-800 font-mono underline"
                                        >
                                            {remarkOpenFor.mobileNo}
                                        </a>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(remarkOpenFor.mobileNo)}
                                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Remark (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={4}
                                    placeholder="Add any remarks about the student's attendance..."
                                    value={remarkOpenFor.remarks || ''}
                                    onChange={(e) => updateRemark(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-slate-200 flex justify-end">
                            <button
                                onClick={() => setRemarkOpenFor(null)}
                                className="px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Confirm Modal */}
            {confirmOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">Confirm Attendance</h3>
                            <p className="text-slate-600 mt-1">Please review the attendance details before saving</p>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-slate-600">Subject:</span>
                                            <div className="font-bold text-slate-800">{subject || '—'}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-600">Date:</span>
                                            <div className="font-bold text-slate-800">{new Date(date).toLocaleDateString()}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-600">Class:</span>
                                            <div className="font-bold text-slate-800">{klass || '—'}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-600">Section:</span>
                                            <div className="font-bold text-slate-800">{section || '—'}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                                            <div className="text-xs text-slate-600">Present</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                                            <div className="text-xs text-slate-600">Absent</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-slate-800">{students.length}</div>
                                            <div className="text-xs text-slate-600">Total</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-slate-200 flex gap-3">
                            <button 
                                onClick={() => setConfirmOpen(false)}
                                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmSave}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                            >
                                Save Attendance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}