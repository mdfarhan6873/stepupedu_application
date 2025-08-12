"use client";

import { useState } from "react";

interface Period {
  time: string;
  subject: string;
  teacherName: string;
  class: string;
  section: string;
}

interface ScheduleFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: any;
}

export default function ScheduleForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData
}: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    class: initialData?.class || "",
    section: initialData?.section || "",
    academicYear: initialData?.academicYear || "",
    schedule: {
      monday: initialData?.schedule?.monday || [],
      tuesday: initialData?.schedule?.tuesday || [],
      wednesday: initialData?.schedule?.wednesday || [],
      thursday: initialData?.schedule?.thursday || [],
      friday: initialData?.schedule?.friday || [],
      saturday: initialData?.schedule?.saturday || [],
      sunday: initialData?.schedule?.sunday || [],
    }
  });

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const subjects = [
    "Mathematics", "English", "Hindi", "Science", "Social Science", 
    "Physics", "Chemistry", "Biology", "History", "Geography", 
    "Political Science", "Economics", "Computer Science", "Physical Education"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addPeriod = (day: string) => {
    const newPeriod: Period = {
      time: "",
      subject: "",
      teacherName: "",
      class: formData.class,
      section: formData.section
    };

    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: [...prev.schedule[day as keyof typeof prev.schedule], newPeriod]
      }
    }));
  };

  const removePeriod = (day: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: prev.schedule[day as keyof typeof prev.schedule].filter((_, i) => i !== index)
      }
    }));
  };

  const updatePeriod = (day: string, index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: prev.schedule[day as keyof typeof prev.schedule].map((period, i) =>
          i === index ? { ...period, [field]: value } : period
        )
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {initialData ? "Edit Schedule" : "Add Schedule"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter schedule title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 2024-25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class *
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Class</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                  <option value="5th">5th</option>
                  <option value="6th">6th</option>
                  <option value="7th">7th</option>
                  <option value="8th">8th</option>
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter schedule description..."
              />
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">Weekly Schedule</h4>
              
              {days.map(day => (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-900 capitalize">{day}</h5>
                    <button
                      type="button"
                      onClick={() => addPeriod(day)}
                      className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
                    >
                      Add Period
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.schedule[day as keyof typeof formData.schedule].map((period: Period, index: number) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-md">
                        <input
                          type="text"
                          placeholder="Time (e.g., 09:00-10:00)"
                          value={period.time}
                          onChange={(e) => updatePeriod(day, index, 'time', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <select
                          value={period.subject}
                          onChange={(e) => updatePeriod(day, index, 'subject', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Teacher Name"
                          value={period.teacherName}
                          onChange={(e) => updatePeriod(day, index, 'teacherName', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => removePeriod(day, index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    {formData.schedule[day as keyof typeof formData.schedule].length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-2">No periods added for this day</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : initialData ? "Update Schedule" : "Create Schedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
