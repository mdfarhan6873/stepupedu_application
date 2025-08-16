'use client'
import React, { useState, useEffect } from 'react';
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
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      {/* Enhanced Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-42 right-6 z-40 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-2xl p-4 hover:scale-110 transition-all duration-300 flex items-center gap-3 group"
        style={{ boxShadow: '0 8px 32px 0 rgba(147, 51, 234, 0.3)', bottom: '11rem' }}
        aria-label="View Enquiries"
      >
        <svg className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline text-sm font-semibold pr-1">
          {isOpen ? 'Hide' : 'View'} Enquiries
        </span>
      </button>

      {/* Enhanced Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      Enquiries Management
                    </h3>
                    <p className="text-slate-600">{enquiries.length} enquiries available</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                    <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-purple-400 animate-spin" style={{ animationDelay: '0.15s', animationDuration: '1s' }}></div>
                  </div>
                </div>
              ) : enquiries.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">No enquiries found</h4>
                  <p className="text-slate-500 mb-6">New enquiries will appear here!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {enquiries.map((enquiry) => (
                    <div
                      key={enquiry._id}
                      className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-bold text-slate-800 text-lg">
                              {enquiry.name}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(enquiry.status)}`}>
                              {getStatusIcon(enquiry.status)} {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <a href={`mailto:${enquiry.email}`} className="hover:text-purple-600 transition-colors">
                                {enquiry.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a href={`tel:${enquiry.mobile}`} className="hover:text-purple-600 transition-colors">
                                {enquiry.mobile}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              <span className="text-sm font-medium text-slate-600">Message:</span>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">
                              {enquiry.message}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleDelete(enquiry._id!)}
                            disabled={deletingId === enquiry._id}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            aria-label="Delete enquiry"
                          >
                            {deletingId === enquiry._id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => handleStatusUpdate(enquiry._id!, 'new')}
                          disabled={updatingId === enquiry._id || enquiry.status === 'new'}
                          className="px-4 py-2 text-xs bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-blue-200"
                        >
                          {updatingId === enquiry._id && enquiry.status !== 'new' ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                              Updating...
                            </div>
                          ) : (
                            'Mark as New'
                          )}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(enquiry._id!, 'contacted')}
                          disabled={updatingId === enquiry._id || enquiry.status === 'contacted'}
                          className="px-4 py-2 text-xs bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-yellow-200"
                        >
                          {updatingId === enquiry._id && enquiry.status !== 'contacted' ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent"></div>
                              Updating...
                            </div>
                          ) : (
                            'Mark as Contacted'
                          )}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(enquiry._id!, 'resolved')}
                          disabled={updatingId === enquiry._id || enquiry.status === 'resolved'}
                          className="px-4 py-2 text-xs bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-green-200"
                        >
                          {updatingId === enquiry._id && enquiry.status !== 'resolved' ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border border-green-600 border-t-transparent"></div>
                              Updating...
                            </div>
                          ) : (
                            'Mark as Resolved'
                          )}
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