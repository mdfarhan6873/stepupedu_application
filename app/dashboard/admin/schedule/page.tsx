"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ScheduleForm from "@/components/forms/ScheduleForm";

interface Period {
  time: string;
  subject: string;
  teacherName: string;
  class: string;
  section?: string;
}

interface Schedule {
  _id: string;
  title: string;
  description?: string;
  class: string;
  section?: string;
  academicYear?: string;
  schedule: {
    monday: Period[];
    tuesday: Period[];
    wednesday: Period[];
    thursday: Period[];
    friday: Period[];
    saturday: Period[];
    sunday: Period[];
  };
  isActive: boolean;
  createdAt: string;
}

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
    
    fetchSchedules();
  }, [session, status, router]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/admin/schedule');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const url = editingSchedule 
        ? `/api/admin/schedule/${editingSchedule._id}`
        : '/api/admin/schedule';
      
      const method = editingSchedule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchSchedules();
        setShowForm(false);
        setEditingSchedule(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save schedule');
      }
    } catch (error) {
      alert('An error occurred while saving the schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      const response = await fetch(`/api/admin/schedule/${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSchedules();
      } else {
        alert('Failed to delete schedule');
      }
    } catch (error) {
      alert('An error occurred while deleting the schedule');
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  const getTotalPeriods = (schedule: Schedule) => {
    return Object.values(schedule.schedule).reduce((total, dayPeriods) => total + dayPeriods.length, 0);
  };

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 animate-spin mx-auto" style={{ animationDelay: '0.15s', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading schedules...</p>
          <p className="text-sm text-slate-500 mt-1">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Schedule
                </h1>
                <p className="text-sm text-slate-500 mt-1">Create</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="group relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Create Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8">
          {schedules.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No schedules created yet</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Get started by creating your first class schedule to organize lessons and periods.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
              >
                Create Your First Schedule
              </button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {schedules.map((schedule) => (
                <div key={schedule._id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{schedule.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {schedule.class}
                        </span>
                        {schedule.section && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Section {schedule.section}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          schedule.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {/* Always visible action buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingSchedule(schedule)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200 bg-purple-50/50"
                        title="View full schedule"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 bg-blue-50/50"
                        title="Edit schedule"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(schedule._id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 bg-red-50/50"
                        title="Delete schedule"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {schedule.description && (
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-sm text-slate-700">{schedule.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {schedule.academicYear && (
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-600">Academic Year:</span>
                          <span className="text-slate-800">{schedule.academicYear}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-600">Total Periods:</span>
                        <span className="font-bold text-slate-800">{getTotalPeriods(schedule)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Weekly Overview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Weekly Overview
                      </h4>
                      <button
                        onClick={() => setViewingSchedule(schedule)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium bg-purple-50 px-2 py-1 rounded-lg transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                        const dayKey = Object.keys(schedule.schedule)[index] as keyof typeof schedule.schedule;
                        const periodsCount = schedule.schedule[dayKey].length;
                        return (
                          <div key={day} className="text-center">
                            <div className="text-xs font-semibold text-slate-600 mb-2">{day}</div>
                            <div className={`relative h-12 w-full rounded-xl text-xs flex items-center justify-center text-white font-bold shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer ${
                              periodsCount > 0 
                                ? periodsCount <= 3 
                                  ? 'bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600' 
                                  : periodsCount <= 6 
                                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600' 
                                  : 'bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600'
                                : 'bg-gradient-to-br from-gray-300 to-gray-400'
                            }`}
                            onClick={() => setViewingSchedule(schedule)}
                            >
                              <span className="relative z-10">{periodsCount}</span>
                              {periodsCount > 0 && (
                                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {periodsCount === 0 ? 'Free' : `${periodsCount} period${periodsCount > 1 ? 's' : ''}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Schedule Detail Modal */}
      {viewingSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{viewingSchedule.title}</h2>
                  <p className="text-slate-600 mt-1">
                    {viewingSchedule.class} {viewingSchedule.section && `- Section ${viewingSchedule.section}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingSchedule(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid gap-6">
                {Object.entries(viewingSchedule.schedule).map(([dayKey, periods]) => (
                  <div key={dayKey} className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                        periods.length > 0 
                          ? periods.length <= 3 
                            ? 'bg-green-500' 
                            : periods.length <= 6 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                          : 'bg-gray-400'
                      }`}></div>
                      {dayNames[dayKey as keyof typeof dayNames]}
                      <span className="ml-2 text-sm font-normal text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                        {periods.length} period{periods.length !== 1 ? 's' : ''}
                      </span>
                    </h3>
                    
                    {periods.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </div>
                        <p className="text-slate-500 italic font-medium">No periods scheduled</p>
                        <p className="text-slate-400 text-sm mt-1">This day is free</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {periods.map((period, index) => (
                          <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                                {period.time}
                              </span>
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                Period {index + 1}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium text-slate-600">Subject</p>
                                <p className="font-bold text-slate-800">{period.subject}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-600">Teacher</p>
                                <p className="font-semibold text-slate-700">{period.teacherName}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal remains unchanged */}
      {showForm && (
        <ScheduleForm
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isSubmitting}
          initialData={editingSchedule}
        />
      )}
    </div>
  );
}