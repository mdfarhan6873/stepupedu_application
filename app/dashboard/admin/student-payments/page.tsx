"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentPaymentForm from "@/components/forms/StudentPaymentForm";

interface Student {
  _id: string;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  mobileNo: string;
}

interface StudentPayment {
  _id: string;
  studentId: Student;
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

export default function StudentPaymentManagement() {
  const router = useRouter();
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<StudentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<StudentPayment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, selectedMonth, selectedYear, selectedClass, selectedSection, selectedStatus]);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/student-payments");
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
        payment.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.studentId.rollNo.includes(searchTerm) ||
        payment.studentId.mobileNo.includes(searchTerm) ||
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

    // Class filter
    if (selectedClass) {
      filtered = filtered.filter(payment => payment.studentId.class === selectedClass);
    }

    // Section filter
    if (selectedSection) {
      filtered = filtered.filter(payment => payment.studentId.section === selectedSection);
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
      const response = await fetch("/api/admin/student-payments", {
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
      const response = await fetch(`/api/admin/student-payments/${editingPayment._id}`, {
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
      const response = await fetch(`/api/admin/student-payments/${paymentId}`, {
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

  const openEditForm = (payment: StudentPayment) => {
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
    setSelectedClass("");
    setSelectedSection("");
    setSelectedStatus("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const handlePrintReceipt = (payment: StudentPayment) => {
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
              <div>Student Fee Receipt</div>
              <div class="receipt-title">Receipt #${payment.receiptNumber}</div>
            </div>
            
            <div class="receipt-details">
              <div class="detail-row">
                <span class="detail-label">Student Name:</span>
                <span class="detail-value">${payment.studentId.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Class:</span>
                <span class="detail-value">${payment.studentId.class}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Section:</span>
                <span class="detail-value">${payment.studentId.section}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Roll Number:</span>
                <span class="detail-value">${payment.studentId.rollNo}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Mobile Number:</span>
                <span class="detail-value">${payment.studentId.mobileNo}</span>
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
  const uniqueClasses = [...new Set(payments.map(p => p.studentId.class))].sort();
  const uniqueSections = [...new Set(payments.map(p => p.studentId.section))].sort();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-full bg-gradient-to-br from-slate-50 to-cyan-50"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header with Back Button */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Student Payments</p>
            </div>
          </div>
          
          {/* Mobile Add Button */}
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>
          
          {/* Desktop Add Button */}
          <div className="hidden sm:flex justify-end">
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Payment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by student name, roll no, mobile, or receipt no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Month Filter */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            {/* Section Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Sections</option>
              {uniqueSections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPayments.length} of {payments.length} payments
            {filteredPayments.length > 0 && (
              <span className="ml-4 font-medium">
                Total Amount: {formatAmount(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
              </span>
            )}
          </div>
        </div>

        {/* Enhanced Payments Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {currentPayments.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No payments found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {(searchTerm || selectedMonth || selectedYear || selectedClass || selectedSection || selectedStatus)
                  ? 'Try adjusting your search criteria to find more payments.'
                  : 'Get started by adding your first student payment record.'}
              </p>
              {!(searchTerm || selectedMonth || selectedYear || selectedClass || selectedSection || selectedStatus) && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
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
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Student</th>
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
                            <div className="text-sm font-semibold text-slate-900">{payment.studentId.name}</div>
                            <div className="text-sm text-slate-500">
                              {payment.studentId.class}-{payment.studentId.section} | Roll: {payment.studentId.rollNo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">{payment.receiptNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-cyan-600">{formatAmount(payment.amount)}</div>
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            payment.status === 'Refunded' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handlePrintReceipt(payment)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Print Receipt"
                          >
                            Print
                          </button>
                          <button
                            onClick={() => openEditForm(payment)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(endIndex, filteredPayments.length)}</span> of{' '}
                        <span className="font-medium">{filteredPayments.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Payment Form Modal */}
      {showForm && (
        <StudentPaymentForm
          payment={editingPayment ? {
            _id: editingPayment._id,
            studentId: editingPayment.studentId._id,
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