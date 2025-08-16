"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface Payment {
  _id: string;
  teacherName: string;
  mobileNo: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  transactionId?: string;
  receiptNumber?: string;
  paymentDate: string;
  paymentMonth: number;
  paymentYear: number;
  remarks?: string;
  status: string;
  createdBy?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/teacher/payments");
        if (res.ok) {
          const data = await res.json();
          setPayments(data);
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-all duration-200 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-2xl hover:bg-white/80 shadow-sm hover:shadow-md"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Payments
              </h1>
              <p className="text-sm text-gray-500">Track your payment history</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {/* Payments Grid */}
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg font-medium">No payments found</p>
            <p className="text-gray-500 text-sm mt-1">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/50 cursor-pointer group"
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="text-indigo-600 group-hover:translate-x-1 transition-transform duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                  ₹{payment.amount.toLocaleString()}
                </h2>
                <p className="text-gray-600 text-sm mb-3 font-medium">{payment.teacherName}</p>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-3 mb-3">
                  <p className="text-gray-700 text-xs font-medium">
                    {formatDate(payment.paymentDate)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                    payment.status.toLowerCase() === "completed"
                      ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                      : "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    payment.status.toLowerCase() === "completed" ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      <Dialog
        open={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh] border border-white/50">
            {selectedPayment && (
              <>
                {/* Close Button */}
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Payment Details
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">Transaction information</p>
                    </div>
                  </div>
                  
                  {/* Amount Highlight */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-green-600 font-medium mb-1">Amount</p>
                      <p className="text-3xl font-bold text-green-700">₹{selectedPayment.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Teacher Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-800">{selectedPayment.teacherName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mobile:</span>
                        <span className="font-medium text-gray-800">{selectedPayment.mobileNo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Payment Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium text-gray-800">{selectedPayment.paymentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium text-gray-800">{selectedPayment.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-800">{formatDate(selectedPayment.paymentDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Period:</span>
                        <span className="font-medium text-gray-800">{selectedPayment.paymentMonth}/{selectedPayment.paymentYear}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedPayment.status.toLowerCase() === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            selectedPayment.status.toLowerCase() === "completed" ? "bg-green-500" : "bg-red-500"
                          }`}></div>
                          {selectedPayment.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {(selectedPayment.transactionId || selectedPayment.receiptNumber) && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Transaction Info
                      </h3>
                      <div className="space-y-2 text-sm">
                        {selectedPayment.transactionId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{selectedPayment.transactionId}</span>
                          </div>
                        )}
                        {selectedPayment.receiptNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Receipt No:</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{selectedPayment.receiptNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(selectedPayment.remarks || selectedPayment.createdBy) && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Additional Info
                      </h3>
                      <div className="space-y-2 text-sm">
                        {selectedPayment.remarks && (
                          <div>
                            <span className="text-gray-600 block mb-1">Remarks:</span>
                            <p className="text-gray-800 bg-gray-50 p-2 rounded-lg text-xs">{selectedPayment.remarks}</p>
                          </div>
                        )}
                        {selectedPayment.createdBy && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created By:</span>
                            <span className="font-medium text-gray-800">{selectedPayment.createdBy}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
