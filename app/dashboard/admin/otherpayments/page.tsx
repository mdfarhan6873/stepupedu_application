'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentPerson {
  _id: string;
  name: string;
  mobile: string;
  whoHeIs: string;
  paymentCount: number;
  totalAmount: number;
  createdAt: string;
}

interface Payment {
  _id: string;
  personId: {
    _id: string;
    name: string;
    mobile: string;
    whoHeIs: string;
  };
  amount: number;
  date: string;
  message: string;
  receiptNo: string;
  modeOfPayment: string;
  createdAt: string;
}

const OtherPaymentsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [persons, setPersons] = useState<PaymentPerson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  
  // Selected data
  const [selectedPerson, setSelectedPerson] = useState<PaymentPerson | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [personPayments, setPersonPayments] = useState<Payment[]>([]);
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personForm, setPersonForm] = useState({
    name: '',
    mobile: '',
    whoHeIs: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    message: '',
    modeOfPayment: 'Cash'
  });

  const paymentModes = ['Cash', 'Online', 'Cheque', 'Bank Transfer', 'UPI', 'Card'];

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/payment-persons?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPersons(data.data);
      }
    } catch (error) {
      console.error('Error fetching persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonPayments = async (personId: string) => {
    try {
      const response = await fetch(`/api/admin/other-payments?personId=${personId}`);
      const data = await response.json();
      
      if (data.success) {
        setPersonPayments(data.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchPaymentDetails = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/other-payments/${paymentId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedPayment(data.data);
        setShowPaymentDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/payment-persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPersonForm({ name: '', mobile: '', whoHeIs: '' });
        setShowAddPersonModal(false);
        fetchPersons();
        alert('Person added successfully!');
      } else {
        alert(data.error || 'Failed to add person');
      }
    } catch (error) {
      alert('Error adding person');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/other-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentForm,
          personId: selectedPerson._id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaymentForm({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          message: '',
          modeOfPayment: 'Cash'
        });
        setShowAddPaymentModal(false);
        fetchPersonPayments(selectedPerson._id);
        fetchPersons(); // Refresh to update totals
        alert('Payment added successfully!');
      } else {
        alert(data.error || 'Failed to add payment');
      }
    } catch (error) {
      alert('Error adding payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentsModal = (person: PaymentPerson) => {
    setSelectedPerson(person);
    fetchPersonPayments(person._id);
    setShowPaymentsModal(true);
  };

  const openAddPaymentModal = () => {
    setShowAddPaymentModal(true);
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchPersons();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-emerald-400 animate-spin mx-auto" style={{ animationDelay: '0.15s', animationDuration: '0.3s' }}></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading payments...</p>
          <p className="text-sm text-slate-500 mt-1">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
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
                  Other
                </h1>
                <p className="text-sm text-slate-500">Payments</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddPersonModal(true)}
              className="group relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Add Person</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, mobile, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
            />
          </div>
          <div className="mt-4 text-sm text-slate-600">
            <span className="font-medium text-slate-800">{persons.length}</span> payment persons found
          </div>
        </div>

        {/* Payment Persons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {persons.map((person) => (
            <div
              key={person._id}
              onClick={() => openPaymentsModal(person)}
              className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{person.name}</h3>
                    <p className="text-sm text-slate-600">{person.whoHeIs}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-600">Mobile</span>
                  <span className="text-sm font-mono text-slate-800">{person.mobile}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-xl text-center">
                    <div className="text-lg font-bold text-emerald-600">{person.paymentCount}</div>
                    <div className="text-xs text-emerald-500">Payments</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-center">
                    <div className="text-lg font-bold text-blue-600">{formatAmount(person.totalAmount)}</div>
                    <div className="text-xs text-blue-500">Total</div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500">Click to view payments</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {persons.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No payment persons found</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms to find more payment persons.'
                : 'Get started by adding your first payment person to track their payments.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddPersonModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
              >
                Add Your First Payment Person
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Person Modal */}
      {showAddPersonModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">Add Payment Person</h2>
              <button
                onClick={() => setShowAddPersonModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddPerson} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={personForm.name}
                  onChange={(e) => setPersonForm({...personForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={personForm.mobile}
                  onChange={(e) => setPersonForm({...personForm, mobile: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Who He/She Is *</label>
                <input
                  type="text"
                  required
                  value={personForm.whoHeIs}
                  onChange={(e) => setPersonForm({...personForm, whoHeIs: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Vendor, Contractor, Service Provider"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPersonModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Adding...' : 'Add Person'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payments Modal */}
      {showPaymentsModal && selectedPerson && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedPerson.name}</h2>
                <p className="text-slate-600 mt-1">{selectedPerson.whoHeIs} | {selectedPerson.mobile}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={openAddPaymentModal}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Add Payment
                </button>
                <button
                  onClick={() => setShowPaymentsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {personPayments.length > 0 ? (
                <div className="space-y-4">
                  {personPayments.map((payment) => (
                    <div
                      key={payment._id}
                      onClick={() => fetchPaymentDetails(payment._id)}
                      className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg font-bold text-emerald-600">{formatAmount(payment.amount)}</span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              {payment.modeOfPayment}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 mb-2">{payment.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>Receipt: {payment.receiptNo}</span>
                            <span>Date: {formatDate(payment.date)}</span>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No payments yet</h3>
                  <p className="text-slate-600 mb-4">Start by adding the first payment for {selectedPerson.name}</p>
                  <button
                    onClick={openAddPaymentModal}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Add First Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && selectedPerson && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Add Payment</h2>
                <p className="text-slate-600 text-sm">For {selectedPerson.name}</p>
              </div>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mode of Payment *</label>
                <select
                  required
                  value={paymentForm.modeOfPayment}
                  onChange={(e) => setPaymentForm({...paymentForm, modeOfPayment: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {paymentModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message *</label>
                <textarea
                  required
                  rows={3}
                  value={paymentForm.message}
                  onChange={(e) => setPaymentForm({...paymentForm, message: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Enter payment description or purpose"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Adding...' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Payment Detail Modal with Proper Scrolling */}
      {showPaymentDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Payment Details</h2>
                <p className="text-slate-600 mt-1">Receipt No: {selectedPayment.receiptNo}</p>
              </div>
              <button
                onClick={() => setShowPaymentDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Payment Amount */}
                <div className="text-center bg-emerald-50 p-6 rounded-2xl">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {formatAmount(selectedPayment.amount)}
                  </div>
                  <div className="text-sm text-emerald-700">Payment Amount</div>
                </div>

                {/* Payment Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <h3 className="text-sm font-semibold text-slate-600 mb-3">Person Details</h3>
                      <div className="space-y-2">
                        <p className="font-semibold text-slate-800">{selectedPayment.personId.name}</p>
                        <p className="text-sm text-slate-600">{selectedPayment.personId.whoHeIs}</p>
                        <p className="text-sm font-mono text-slate-700">{selectedPayment.personId.mobile}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl">
                      <h3 className="text-sm font-semibold text-slate-600 mb-3">Payment Info</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Date:</span>
                          <span className="text-sm font-semibold text-slate-800">{formatDate(selectedPayment.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Mode:</span>
                          <span className="text-sm font-semibold text-blue-600">{selectedPayment.modeOfPayment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Receipt:</span>
                          <span className="text-sm font-mono text-slate-800">{selectedPayment.receiptNo}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-600 mb-3">Payment Message</h3>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-slate-700 leading-relaxed">{selectedPayment.message}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="text-sm font-semibold text-slate-600 mb-3">Record Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Created:</span>
                      <span className="ml-2 text-slate-800">{new Date(selectedPayment.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Updated:</span>
                      <span className="ml-2 text-slate-800">{new Date(selectedPayment.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className="border-t border-slate-200 p-6 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const printContent = `
                      PAYMENT RECEIPT
                      Receipt No: ${selectedPayment.receiptNo}
                      
                      Person: ${selectedPayment.personId.name}
                      Role: ${selectedPayment.personId.whoHeIs}
                      Mobile: ${selectedPayment.personId.mobile}
                      
                      Amount: ${formatAmount(selectedPayment.amount)}
                      Date: ${formatDate(selectedPayment.date)}
                      Mode: ${selectedPayment.modeOfPayment}
                      
                      Message: ${selectedPayment.message}
                      
                      Generated on: ${new Date().toLocaleString('en-IN')}
                    `;
                    
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head><title>Payment Receipt</title></head>
                          <body style="font-family: monospace; padding: 20px; white-space: pre-line;">
                            ${printContent}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                  className="flex-1 px-6 py-3 border border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setShowPaymentDetailModal(false)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherPaymentsPage;