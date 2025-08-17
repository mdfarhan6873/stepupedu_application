"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Phone, Lock, GraduationCap, Users, Edit2, Save, X, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  mobileNo: string;
  parentName: string;
  parentMobileNo: string;
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const Profile = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const response = await fetch('/api/students/profile');
      if (response.ok) {
        const data = await response.json();
        setStudent(data.student);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
    setCurrentPassword('');
    setMessage(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
    setCurrentPassword('');
    setMessage(null);
  };

  const handleSave = async () => {
    if (!editValue.trim()) {
      setMessage({ type: 'error', text: 'Value cannot be empty' });
      return;
    }

    if (editingField === 'password' && !currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }

    if (editingField === 'password' && editValue.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    if (editingField === 'mobileNo' && !/^\d{10}$/.test(editValue)) {
      setMessage({ type: 'error', text: 'Mobile number must be 10 digits' });
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/students/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: editingField,
          value: editValue,
          currentPassword: editingField === 'password' ? currentPassword : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStudent(data.student);
        setMessage({ type: 'success', text: data.message });
        setEditingField(null);
        setEditValue('');
        setCurrentPassword('');
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const editableFields = [
    { key: 'mobileNo', label: 'Mobile Number', icon: Phone, type: 'tel' },
    { key: 'password', label: 'Password', icon: Lock, type: 'password' },
    // { key: 'class', label: 'Class', icon: GraduationCap, type: 'text' },
    // { key: 'section', label: 'Section', icon: Users, type: 'text' },
  ];

  const readOnlyFields = [
    { key: 'name', label: 'Full Name', value: student.name, icon: User },
    { key: 'rollNo', label: 'Roll Number', value: student.rollNo, icon: GraduationCap },
    { key: 'parentName', label: 'Parent Name', value: student.parentName, icon: User },
    { key: 'parentMobileNo', label: 'Parent Mobile', value: student.parentMobileNo, icon: Phone },
    { key: 'address', label: 'Address', value: student.address, icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex-1"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-600">Class {student.class} - Section {student.section}</p>
              <p className="text-sm text-gray-500">Roll No: {student.rollNo}</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editable Fields */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Editable Information</h2>
            <div className="space-y-4">
              {editableFields.map((field) => {
                const Icon = field.icon;
                const currentValue = field.key === 'password' ? '••••••••' : student[field.key as keyof Student];
                const isEditing = editingField === field.key;

                return (
                  <div key={field.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{field.label}</span>
                      </div>
                      {!isEditing && (
                        <button
                          onClick={() => handleEdit(field.key, field.key === 'password' ? '' : currentValue as string)}
                          className="text-indigo-600 hover:text-indigo-800 p-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        {field.key === 'password' && (
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              placeholder="Current Password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                        
                        <div className="relative">
                          <input
                            type={field.key === 'password' ? (showNewPassword ? 'text' : 'password') : field.type}
                            placeholder={field.key === 'password' ? 'New Password' : field.label}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                          />
                          {field.key === 'password' && (
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            disabled={updating}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm"
                          >
                            <Save className="w-3 h-3" />
                            <span>{updating ? 'Saving...' : 'Save'}</span>
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">{currentValue}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Read-only Fields */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="space-y-4">
              {readOnlyFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{field.label}</span>
                    </div>
                    <p className="text-gray-900 font-medium">{field.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Account Created</span>
              <p className="text-gray-900">{formatDate(student.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Last Updated</span>
              <p className="text-gray-900">{formatDate(student.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;