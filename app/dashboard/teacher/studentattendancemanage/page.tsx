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
    const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [klass, setKlass] = useState<string>('');
    const [section, setSection] = useState<string>('');
    const [subject, setSubject] = useState<string>('');

    // Options
    const [classes, setClasses] = useState<string[]>([]);
    const [sections, setSections] = useState<string[]>([]);

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
            const res = await fetch('/api/classes');
            if (!res.ok) return;
            const data = await res.json();
            setClasses(data.classes || []);
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
            const res = await fetch(`/api/sections?class=${encodeURIComponent(klass)}`);
            if (!res.ok) return;
            const data = await res.json();
            setSections(data.sections || []);
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
                // default Present
                const rows: StudentRow[] = base.map((s) => ({
                    _id: s._id,
                    name: s.name,
                    rollNo: s.rollNo,
                    mobileNo: s.mobileNo,
                    status: 'Present',
                    remarks: '',
                }));
                setStudents(rows);
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
            alert('Attendance saved!');
            router.push('/dashboard/teacher'); // ✅ Redirect here
        } catch (e: any) {
            alert(e.message || 'Save failed');
        }
    }


    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="rounded-2xl px-3 py-2 border shadow-sm hover:shadow transition"
                    aria-label="Go back"
                >
                    ← Back
                </button>
                <h1 className="text-2xl md:text-3xl font-semibold">Attendance</h1>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Date</label>
                    <input
                        type="date"
                        className="border rounded-xl px-3 py-2"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Class</label>
                    <select
                        className="border rounded-xl px-3 py-2"
                        value={klass}
                        onChange={(e) => setKlass(e.target.value)}
                    >
                        <option value="">Select class</option>
                        {classes.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Section</label>
                    <select
                        className="border rounded-xl px-3 py-2"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        disabled={!klass}
                    >
                        <option value="">Select section</option>
                        {sections.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Subject</label>
                    <input
                        type="text"
                        className="border rounded-xl px-3 py-2"
                        placeholder="e.g. Mathematics"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-2 py-3 text-left font-medium">Roll No</th>
                                <th className="px-2 py-3 text-left font-medium">Name</th>
                                <th className="px-2 py-3 text-left font-medium">Status</th>
                                <th className="px-2 py-3 text-left font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingStudents ? (
                                <tr><td className="px-4 py-4" colSpan={5}>Loading students…</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td className="px-4 py-4" colSpan={5}>No students</td></tr>
                            ) : (
                                students.map((s) => (
                                    <tr key={s._id} className="border-t">
                                        <td className="px-2 py-3">{s.rollNo}</td>
                                        <td className="px-2 py-3">{s.name}</td>
                                        <td className="px-2 py-3">
                                            <button
                                                onClick={() => toggleStatus(s._id)}
                                                className={`px-3 py-1 rounded-full border shadow-sm transition ${s.status === 'Present'
                                                    ? 'bg-green-50 border-green-300'
                                                    : 'bg-red-50 border-red-300'
                                                    }`}
                                            >
                                                {s.status}
                                            </button>
                                        </td>

                                        <td className="px-2 py-3">
                                            <button
                                                onClick={() => openRemark(s)}
                                                className="px-2 py-1 rounded-xl border shadow-sm hover:shadow"
                                            >
                                                Add/View Remark
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer: counts + save */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-4 py-3 bg-gray-50">
                    <div className="text-sm">
                        <span className="mr-4">Present: <strong>{presentCount}</strong></span>
                        <span>Absent: <strong>{absentCount}</strong></span>
                        {loadingAttendance && <span className="ml-4 text-gray-500">Prefilling existing attendance…</span>}
                    </div>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-2xl bg-black text-white shadow hover:opacity-90"
                    >
                        Mark Attendance
                    </button>
                </div>
            </div>

            {/* Remark Modal */}
            {remarkOpenFor && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4">
                        <h3 className="text-lg font-semibold mb-2">Remark for {remarkOpenFor.name}</h3>
                        <div className="text-sm mb-3">
                            <div className="mb-1">Roll No: <strong>{remarkOpenFor.rollNo}</strong></div>
                            <div className="mb-1">
                                Mobile: <a className="underline" href={`tel:${remarkOpenFor.mobileNo}`}>{remarkOpenFor.mobileNo}</a>
                                <button
                                    className="ml-2 px-2 py-0.5 rounded border"
                                    onClick={() => navigator.clipboard.writeText(remarkOpenFor.mobileNo)}
                                >
                                    Copy
                                </button>
                            </div>
                            <div className="mb-2">Status: <strong>{remarkOpenFor.status}</strong></div>
                        </div>
                        <textarea
                            className="w-full border rounded-xl px-3 py-2 min-h-28"
                            placeholder="Type a remark (optional)…"
                            value={remarkOpenFor.remarks || ''}
                            onChange={(e) => updateRemark(e.target.value)}
                        />
                        <div className="mt-3 flex justify-end gap-2">
                            <button
                                className="px-3 py-1.5 rounded-xl border"
                                onClick={() => setRemarkOpenFor(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {confirmOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4">
                        <h3 className="text-lg font-semibold mb-3">Confirm Save</h3>
                        <div className="text-sm space-y-1 mb-3">
                            <div>Subject: <strong>{subject || '—'}</strong></div>
                            <div>Date: <strong>{date}</strong></div>
                            <div>Class/Section: <strong>{klass || '—'} {section || ''}</strong></div>
                            <div>Present: <strong>{presentCount}</strong></div>
                            <div>Absent: <strong>{absentCount}</strong></div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button className="px-3 py-1.5 rounded-xl border" onClick={() => setConfirmOpen(false)}>
                                Cancel
                            </button>
                            <button className="px-3 py-1.5 rounded-xl bg-black text-white" onClick={confirmSave}>
                                Save Attendance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
