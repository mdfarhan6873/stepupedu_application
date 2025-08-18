'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, BookOpenIcon, DocumentTextIcon, LinkIcon, CalendarIcon } from "@heroicons/react/24/outline";

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading notes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
                <div className="px-4 sm:px-6">
                    <div className="flex items-center h-16 gap-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl text-sm font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Back
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                                <BookOpenIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                    Study Notes
                                </h1>
                                <p className="text-xs text-gray-500">Access your class notes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6">
                {notes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpenIcon className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Notes Found</h3>
                        <p className="text-gray-600">Your study notes will appear here once uploaded.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {notes.map((note) => (
                            <div
                                key={note._id}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/50 cursor-pointer group"
                                onClick={() => setSelectedNote(note)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                                        <DocumentTextIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                        {note.subject}
                                    </span>
                                </div>
                                
                                <h2 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{note.title}</h2>
                                
                                <div className="space-y-2 mb-3">
                                    <p className="text-sm font-medium text-gray-700">
                                        Class {note.class} - Section {note.section}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {note.url && (
                                        <div className="flex items-center gap-2 text-xs text-blue-600">
                                            <LinkIcon className="w-4 h-4" />
                                            <span>Has attachment</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-xs text-yellow-600 font-semibold">Tap to view details</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedNote && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full relative overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-white relative">
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
                            >
                                ✕
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedNote.title}</h2>
                                    <p className="text-yellow-100 text-sm">
                                        Class {selectedNote.class} - Section {selectedNote.section}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Subject</h3>
                                    <p className="text-gray-700">{selectedNote.subject}</p>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                        {selectedNote.description}
                                    </p>
                                </div>

                                {selectedNote.url && (
                                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4" />
                                            Attached File
                                        </h3>
                                        <a
                                            href={selectedNote.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl text-sm font-semibold hover:bg-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                        >
                                            <DocumentTextIcon className="w-4 h-4" />
                                            View Attached File
                                        </a>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4" />
                                        Created Date
                                    </h3>
                                    <p className="text-gray-700 text-sm">
                                        {new Date(selectedNote.createdAt).toLocaleDateString("en-GB", {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center">
                                    Created by {selectedNote.createdBy}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default NotesPage;
