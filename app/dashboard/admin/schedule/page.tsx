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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Schedule Management</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Create New Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new schedule.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {schedules.map((schedule) => (
                <div key={schedule._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{schedule.title}</h3>
                      <p className="text-sm text-gray-600">
                        {schedule.class} {schedule.section && `- Section ${schedule.section}`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(schedule._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {schedule.description && (
                      <p><span className="font-medium">Description:</span> {schedule.description}</p>
                    )}
                    {schedule.academicYear && (
                      <p><span className="font-medium">Academic Year:</span> {schedule.academicYear}</p>
                    )}
                    <p><span className="font-medium">Total Periods:</span> {getTotalPeriods(schedule)}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>

                  {/* Weekly Overview */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Weekly Overview</h4>
                    <div className="grid grid-cols-7 gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                        const dayKey = Object.keys(schedule.schedule)[index] as keyof typeof schedule.schedule;
                        const periodsCount = schedule.schedule[dayKey].length;
                        return (
                          <div key={day} className="text-center">
                            <div className="text-xs font-medium text-gray-600 mb-1">{day}</div>
                            <div className={`h-8 w-full rounded text-xs flex items-center justify-center text-white ${
                              periodsCount > 0 
                                ? periodsCount <= 3 
                                  ? 'bg-green-400' 
                                  : periodsCount <= 6 
                                  ? 'bg-yellow-400' 
                                  : 'bg-red-400'
                                : 'bg-gray-300'
                            }`}>
                              {periodsCount}
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

      {/* Form Modal */}
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
