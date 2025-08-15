'use client'
import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, TrashIcon, CheckCircleIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { IEnquiry } from '@/lib/modals/Enquiry';

const EnquiriesManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [enquiries, setEnquiries] = useState<IEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/enquiries');
      const data = await response.json();
      if (data.success) {
        setEnquiries(data.data);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEnquiries();
    }
  }, [isOpen]);

  const handleStatusUpdate = async (id: string, status: 'new' | 'contacted' | 'resolved') => {
    setUpdatingId(id);
    try {
      const response = await fetch('/api/admin/enquiries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();
      if (data.success) {
        setEnquiries(prev => prev.map(enquiry => 
          enquiry._id === id ? { ...enquiry, status } : enquiry
        ));
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/enquiries?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setEnquiries(prev => prev.filter(enquiry => enquiry._id !== id));
      } else {
        alert('Failed to delete enquiry');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return '🆕';
      case 'contacted': return '📞';
      case 'resolved': return '✅';
      default: return '❓';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-52 left-6 z-40 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg p-3 hover:scale-110 transition-all duration-300 flex items-center gap-2"
        style={{ boxShadow: '0 4px 24px 0 rgba(80,0,120,0.15)' }}
        aria-label="View Enquiries"
      >
        {isOpen ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        <span className="hidden sm:inline text-sm font-semibold">
          {isOpen ? 'Hide' : 'View'} Enquiries
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  Enquiries Management ({enquiries.length})
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <EyeSlashIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
              ) : enquiries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No enquiries found.</p>
                  <p className="text-gray-400 text-sm mt-2">New enquiries will appear here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enquiry) => (
                    <div
                      key={enquiry._id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-800 text-lg">
                              {enquiry.name}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enquiry.status)}`}>
                              {getStatusIcon(enquiry.status)} {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <EnvelopeIcon className="w-4 h-4" />
                              <a href={`mailto:${enquiry.email}`} className="hover:text-purple-600">
                                {enquiry.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              <PhoneIcon className="w-4 h-4" />
                              <a href={`tel:${enquiry.mobile}`} className="hover:text-purple-600">
                                {enquiry.mobile}
                              </a>
                            </div>
                            <div className="text-gray-400">
                              {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg border">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {enquiry.message}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleDelete(enquiry._id!)}
                            disabled={deletingId === enquiry._id}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 disabled:opacity-50"
                            aria-label="Delete enquiry"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleStatusUpdate(enquiry._id!, 'new')}
                          disabled={updatingId === enquiry._id || enquiry.status === 'new'}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark as New
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(enquiry._id!, 'contacted')}
                          disabled={updatingId === enquiry._id || enquiry.status === 'contacted'}
                          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark as Contacted
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(enquiry._id!, 'resolved')}
                          disabled={updatingId === enquiry._id || enquiry.status === 'resolved'}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark as Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnquiriesManager;