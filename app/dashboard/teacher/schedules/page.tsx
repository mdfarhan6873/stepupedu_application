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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Schedules</h1>
      </div>

      {/* Schedules Grid */}
      {schedules.length === 0 ? (
        <p className="text-gray-600">No schedules found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((sch) => (
            <div
              key={sch._id}
              className="rounded-xl p-5 shadow-md bg-white hover:shadow-lg transition cursor-pointer border border-gray-100 hover:border-indigo-200"
              onClick={() => setSelectedSchedule(sch)}
            >
              <h2 className="text-lg font-semibold text-indigo-700">{sch.title}</h2>
              <p className="text-gray-600 text-sm">
                Class {sch.class} {sch.section ? `- ${sch.section}` : ""}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                {formatDate(sch.startDate)} — {formatDate(sch.endDate)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Details Modal */}
      <Dialog
        open={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            {selectedSchedule && (
              <>
                {/* Close Button */}
                <button
                  onClick={() => setSelectedSchedule(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Title */}
                <Dialog.Title className="text-2xl font-bold mb-2 text-indigo-700">
                  {selectedSchedule.title}
                </Dialog.Title>
                <p className="text-gray-600 mb-6">
                  Class {selectedSchedule.class}{" "}
                  {selectedSchedule.section ? `- ${selectedSchedule.section}` : ""}
                </p>

                {/* Weekly Schedule Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm text-gray-700">
                    <thead>
                      <tr className="bg-indigo-50 text-indigo-700">
                        <th className="border p-3 text-left font-semibold">Day</th>
                        <th className="border p-3 text-left font-semibold">Subject</th>
                        <th className="border p-3 text-left font-semibold">Time</th>
                        <th className="border p-3 text-left font-semibold">Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day) => {
                        const subjects = selectedSchedule.subjects.filter(
                          (subj) => subj.day === day
                        );

                        if (subjects.length === 0) {
                          return (
                            <tr key={day} className="bg-gray-50">
                              <td className="border p-3 font-medium text-gray-500">
                                {day}
                              </td>
                              <td
                                className="border p-3 text-gray-400 italic"
                                colSpan={3}
                              >
                                No classes
                              </td>
                            </tr>
                          );
                        }

                        return subjects.map((subj, idx) => (
                          <tr
                            key={day + idx}
                            className="hover:bg-indigo-50 transition-colors"
                          >
                            {idx === 0 && (
                              <td
                                className="border p-3 font-semibold bg-gray-50"
                                rowSpan={subjects.length}
                              >
                                {day}
                              </td>
                            )}
                            <td className="border p-3">{subj.subject}</td>
                            <td className="border p-3">
                              {subj.startTime} - {subj.endTime}
                            </td>
                            <td className="border p-3">{subj.teacher}</td>
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
