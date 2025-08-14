'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Note {
    _id: string;
    title: string;
    class: string;
    section: string;
    subject: string;
    description: string;
    url?: string; // ✅ Add this
    createdAt: string;
    createdBy: string;
}


const NotesPage: React.FC = () => {
    const router = useRouter();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch("/api/students/notes");
                if (!res.ok) throw new Error("Failed to fetch notes");
                const data = await res.json();
                setNotes(data);
            } catch (error) {
                console.error("Error fetching notes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                >
                    ← Back
                </button>
                <h1 className="text-xl font-semibold">All Notes</h1>
            </div>

            {/* Loading State */}
            {loading ? (
                <p>Loading notes...</p>
            ) : notes.length === 0 ? (
                <p>No notes found</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {notes.map((note) => (
                        <div
                            key={note._id}
                            className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
                            onClick={() => setSelectedNote(note)}
                        >
                            <h2 className="font-bold text-lg">{note.title}</h2>
                            <p className="text-sm text-gray-600">
                                Class: {note.class} - Section: {note.section}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {/* Modal */}
            {selectedNote && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                        <button
                            onClick={() => setSelectedNote(null)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-2">{selectedNote.title}</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Class: {selectedNote.class} - Section: {selectedNote.section}
                        </p>
                        <p className="mb-2 font-medium">Subject: {selectedNote.subject}</p>
                        <p className="mb-4 whitespace-pre-line">{selectedNote.description}</p>

                        {/* ✅ Show URL if available */}
                        {selectedNote.url && (
                            <a
                                href={selectedNote.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline block mb-4"
                            >
                                View Attached File
                            </a>
                        )}

                        <p className="mt-4 text-xs text-gray-500">
                            Created by {selectedNote.createdBy} on{" "}
                            {new Date(selectedNote.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default NotesPage;
