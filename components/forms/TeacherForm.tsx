"use client";

import { useState, useEffect } from "react";

interface Subject {
  subjectName: string;
  classes: string[];
}

interface Teacher {
  _id?: string;
  name: string;
  mobileNo: string;
  password: string;
  subjects: Subject[];
  address: string;
}

interface TeacherFormProps {
  teacher?: Teacher;
  onSubmit: (data: Teacher) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function TeacherForm({ teacher, onSubmit, onCancel, isLoading }: TeacherFormProps) {
  const [formData, setFormData] = useState<Teacher>({
    name: "",
    mobileNo: "",
    password: "",
    subjects: [],
    address: ""
  });

  const [currentSubject, setCurrentSubject] = useState({
    subjectName: "",
    classes: [] as string[]
  });

  useEffect(() => {
    if (teacher) {
      setFormData(teacher);
    }
  }, [teacher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSubject = () => {
    if (currentSubject.subjectName && currentSubject.classes.length > 0) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, { ...currentSubject }]
      });
      setCurrentSubject({ subjectName: "", classes: [] });
    }
  };

  const removeSubject = (index: number) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index)
    });
  };

  const handleClassSelection = (className: string) => {
    setCurrentSubject({
      ...currentSubject,
      classes: currentSubject.classes.includes(className)
        ? currentSubject.classes.filter(c => c !== className)
        : [...currentSubject.classes, className]
    });
  };

  const availableClasses = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {teacher ? "Edit Teacher" : "Add New Teacher"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter teacher name"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!teacher}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={teacher ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter complete address"
              />
            </div>

            {/* Subjects Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects & Classes
              </label>
              
              {/* Add Subject */}
              <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <input
                      type="text"
                      value={currentSubject.subjectName}
                      onChange={(e) => setCurrentSubject({ ...currentSubject, subjectName: e.target.value })}
                      placeholder="Subject name (e.g., Mathematics, Physics)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Select classes for this subject:</p>
                    <div className="grid grid-cols-6 gap-2">
                      {availableClasses.map((className) => (
                        <button
                          key={className}
                          type="button"
                          onClick={() => handleClassSelection(className)}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            currentSubject.classes.includes(className)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {className}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addSubject}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Subject
                  </button>
                </div>
              </div>

              {/* Display Added Subjects */}
              {formData.subjects.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Added Subjects:</p>
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                      <div>
                        <p className="font-medium">{subject.subjectName}</p>
                        <p className="text-sm text-gray-600">Classes: {subject.classes.join(', ')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Saving..." : teacher ? "Update Teacher" : "Add Teacher"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
