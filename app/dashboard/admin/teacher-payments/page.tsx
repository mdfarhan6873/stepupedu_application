"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TeacherPaymentForm from "@/components/forms/TeacherPaymentForm";

interface Teacher {
  _id: string;
  name: string;
  mobileNo: string;
  subject: string;
  qualification: string;
}

interface TeacherPayment {
  _id: string;
  teacherId: Teacher;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  transactionId?: string;
  paymentDate: string;
  paymentMonth: number;
  paymentYear: number;
  receiptNumber: string;
  remarks?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function TeacherPaymentManagement() {
  const router = useRouter();
  const [payments, setPayments] = useState<TeacherPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<TeacherPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<TeacherPayment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, selectedMonth, selectedYear, selectedStatus]);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/teacher-payments");
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        console.error("Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.teacherId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.teacherId.mobileNo.includes(searchTerm) ||
        payment.teacherId.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Month filter
    if (selectedMonth) {
      filtered = filtered.filter(payment => payment.paymentMonth === parseInt(selectedMonth));
    }

    // Year filter
    if (selectedYear) {
      filtered = filtered.filter(payment => payment.paymentYear === parseInt(selectedYear));
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(payment => payment.status === selectedStatus);
    }

    setFilteredPayments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAddPayment = async (paymentData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/teacher-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        await fetchPayments();
        setShowForm(false);
        alert("Payment added successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to add payment"}`);
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Error adding payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPayment = async (paymentData: any) => {
    if (!editingPayment) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/teacher-payments/${editingPayment._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        await fetchPayments();
        setShowForm(false);
        setEditingPayment(null);
        alert("Payment updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to update payment"}`);
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Error updating payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const response = await fetch(`/api/admin/teacher-payments/${paymentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPayments();
        alert("Payment deleted successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to delete payment"}`);
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Error deleting payment");
    }
  };

  const openEditForm = (payment: TeacherPayment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPayment(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMonth("");
    setSelectedYear("");
    setSelectedStatus("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const handlePrintReceipt = (payment: TeacherPayment) => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.receiptNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .receipt-container { 
              max-width: 600px; 
              margin: 0 auto; 
              border: 2px solid #333; 
              padding: 20px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 15px; 
              margin-bottom: 20px;
            }
            .school-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .receipt-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-top: 10px;
            }
            .receipt-details { 
              margin: 20px 0;
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 8px 0; 
              padding: 5px 0;
            }
            .detail-label { 
              font-weight: bold; 
              width: 40%;
            }
            .detail-value { 
              width: 60%; 
              text-align: right;
            }
            .amount-row { 
              border-top: 2px solid #333; 
              border-bottom: 2px solid #333; 
              margin: 15px 0; 
              padding: 10px 0; 
              font-size: 18px; 
              font-weight: bold;
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 12px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .receipt-container { border: 1px solid #333; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="school-name">Step-Up Education Institute</div>
              <div>Teacher Payment Receipt</div>
              <div class="receipt-title">Receipt #${payment.receiptNumber}</div>
            </div>
            
            <div class="receipt-details">
              <div class="detail-row">
                <span class="detail-label">Teacher Name:</span>
                <span class="detail-value">${payment.teacherId.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Subject:</span>
                <span class="detail-value">${payment.teacherId.subject}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Mobile Number:</span>
                <span class="detail-value">${payment.teacherId.mobileNo}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Type:</span>
                <span class="detail-value">${payment.paymentType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${payment.paymentMethod}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${formatDate(payment.paymentDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Month:</span>
                <span class="detail-value">${new Date(0, payment.paymentMonth - 1).toLocaleString('default', { month: 'long' })} ${payment.paymentYear}</span>
              </div>
              ${payment.transactionId ? `
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${payment.transactionId}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${payment.status}</span>
              </div>
              ${payment.remarks ? `
              <div class="detail-row">
                <span class="detail-label">Remarks:</span>
                <span class="detail-value">${payment.remarks}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="detail-row amount-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value">${formatAmount(payment.amount)}</span>
            </div>
            
            <div class="footer">
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>This is a computer generated receipt.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Check if we're in a Capacitor environment
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      // For Capacitor apps, create a blob and open in new window
      const blob = new Blob([receiptContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
            URL.revokeObjectURL(url);
          }, 500);
        };
      }
    } else {
      // For web browsers
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        };
      }
    }
  };

  // Get unique values for filter dropdowns
  const uniqueYears = [...new Set(payments.map(p => p.paymentYear))].sort((a, b) => b - a);

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

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
    <div className="min-h-screen text-stone-600 bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white text-slate-600 hover:text-slate-800 transition-all duration-200 hover:scale-105 shadow-sm mr-4"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Teacher
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Payments</p>
            </div>
          </div>
          
          {/* Enhanced Add Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(true)}
              className="group relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Add Payment</span>
            </button>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by teacher name, mobile, subject, or receipt no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Month Filter */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-white/60 rounded-xl transition-all duration-200 font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Enhanced Results Summary */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">{filteredPayments.length}</span> payments found
              {filteredPayments.length > 0 && (
                <span className="ml-4 font-semibold text-emerald-600">
                  Total: {formatAmount(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
                </span>
              )}
            </div>
            {(searchTerm || selectedMonth || selectedYear || selectedStatus) && (
              <button
                onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors duration-200"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Payments Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {currentPayments.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No payments found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {(searchTerm || selectedMonth || selectedYear || selectedStatus)
                  ? 'Try adjusting your search criteria to find more payments.'
                  : 'Get started by adding your first teacher payment record.'}
              </p>
              {!(searchTerm || selectedMonth || selectedYear || selectedStatus) && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                >
                  Add Your First Payment
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/80 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Teacher</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Receipt No</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-slate-200">
                    {currentPayments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-white/80 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{payment.teacherId.name}</div>
                            <div className="text-sm text-slate-500">
                              {payment.teacherId.subject} | {payment.teacherId.mobileNo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">{payment.receiptNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-emerald-600">{formatAmount(payment.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{payment.paymentType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{payment.paymentMethod}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{formatDate(payment.paymentDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            payment.status === 'Refunded' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handlePrintReceipt(payment)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                            title="Print Receipt"
                          >
                            Print
                          </button>
                          <button
                            onClick={() => openEditForm(payment)}
                            className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment._id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="bg-white/60 backdrop-blur-sm px-4 py-4 flex items-center justify-between border-t border-slate-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(endIndex, filteredPayments.length)}</span> of{' '}
                        <span className="font-medium">{filteredPayments.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                                currentPage === page
                                  ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                                  : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payment Form Modal remains unchanged */}
      {showForm && (
        <TeacherPaymentForm
          payment={editingPayment ? {
            _id: editingPayment._id,
            teacherId: editingPayment.teacherId._id,
            amount: editingPayment.amount,
            paymentType: editingPayment.paymentType,
            paymentMethod: editingPayment.paymentMethod,
            transactionId: editingPayment.transactionId || "",
            paymentDate: editingPayment.paymentDate,
            remarks: editingPayment.remarks || "",
            status: editingPayment.status
          } : undefined}
          onSubmit={editingPayment ? handleEditPayment : handleAddPayment}
          onCancel={closeForm}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}