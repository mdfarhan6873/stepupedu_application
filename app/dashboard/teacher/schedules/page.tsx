"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Subject {
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
  teacher: string;
}

interface Schedule {
  _id: string;
  title: string;
  class: string;
  section?: string;
  startDate: string | null;
  endDate: string | null;
  subjects: Subject[];
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const res = await fetch("/api/schedules");
        if (res.ok) {
          const data = await res.json();
          setSchedules(data);
        }
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedules();
  }, []);

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-all duration-200 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-2xl hover:bg-white/80 shadow-sm hover:shadow-md"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Schedules
              </h1>
              <p className="text-sm text-gray-500">View your class schedules</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {/* Schedules Grid */}
        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg font-medium">No schedules found</p>
            <p className="text-gray-500 text-sm mt-1">Your class schedules will appear here</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {schedules.map((sch) => (
              <div
                key={sch._id}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/50 cursor-pointer group"
                onClick={() => setSelectedSchedule(sch)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-indigo-600 group-hover:translate-x-1 transition-transform duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                  {sch.title}
                </h2>
                <p className="text-gray-600 text-sm mb-3">
                  Class {sch.class} {sch.section ? `- ${sch.section}` : ""}
                </p>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-3">
                  <p className="text-gray-700 text-xs font-medium">
                    {formatDate(sch.startDate)} — {formatDate(sch.endDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Details Modal */}
      <Dialog
        open={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-4xl w-full p-6 relative overflow-y-auto max-h-[90vh] border border-white/50">
            {selectedSchedule && (
              <>
                {/* Close Button */}
                <button
                  onClick={() => setSelectedSchedule(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <Dialog.Title className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {selectedSchedule.title}
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">
                      Class {selectedSchedule.class}{" "}
                      {selectedSchedule.section ? `- ${selectedSchedule.section}` : ""}
                    </p>
                  </div>
                </div>

                {/* Weekly Schedule Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/50 shadow-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <th className="p-4 text-left font-semibold">Day</th>
                        <th className="p-4 text-left font-semibold">Subject</th>
                        <th className="p-4 text-left font-semibold">Time</th>
                        <th className="p-4 text-left font-semibold">Teacher</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/70 backdrop-blur-sm">
                      {DAYS.map((day) => {
                        const subjects = selectedSchedule.subjects.filter(
                          (subj) => subj.day === day
                        );

                        if (subjects.length === 0) {
                          return (
                            <tr key={day} className="border-b border-white/50 hover:bg-white/50 transition-colors">
                              <td className="p-4 font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100">
                                {day}
                              </td>
                              <td
                                className="p-4 text-gray-400 italic"
                                colSpan={3}
                              >
                                No classes scheduled
                              </td>
                            </tr>
                          );
                        }

                        return subjects.map((subj, idx) => (
                          <tr
                            key={day + idx}
                            className="border-b border-white/50 hover:bg-indigo-50/50 transition-colors"
                          >
                            {idx === 0 && (
                              <td
                                className="p-4 font-semibold text-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50"
                                rowSpan={subjects.length}
                              >
                                {day}
                              </td>
                            )}
                            <td className="p-4 font-medium text-gray-800">{subj.subject}</td>
                            <td className="p-4 text-gray-600">
                              <span className="bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1 rounded-full text-sm font-medium">
                                {subj.startTime} - {subj.endTime}
                              </span>
                            </td>
                            <td className="p-4 text-gray-700">{subj.teacher}</td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
