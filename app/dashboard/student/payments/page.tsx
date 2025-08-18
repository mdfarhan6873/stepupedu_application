"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CurrencyRupeeIcon, CreditCardIcon, CalendarIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

interface Payment {
  _id: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  transactionId?: string;
  receiptNumber: string;
  paymentDate: string;
  status: string;
  remarks?: string;
  createdBy: string;
}

export default function StudentPayments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    async function fetchPayments() {
      try {
        const res = await fetch("/api/students/payments");
        if (!res.ok) throw new Error("Failed to fetch payments");
        const data: Payment[] = await res.json();
        setPayments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, [session, status, router]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CurrencyRupeeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  My Payments
                </h1>
                <p className="text-xs text-gray-500">View your payment history</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CurrencyRupeeIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payments Found</h3>
            <p className="text-gray-600">Your payment history will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/50 cursor-pointer group"
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <CreditCardIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    {payment.status}
                  </span>
                </div>
                
                <h2 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">{payment.paymentType}</h2>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <CurrencyRupeeIcon className="w-4 h-4 text-green-600" />
                    <span className="text-xl font-bold text-green-600">₹{payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(payment.paymentDate).toLocaleDateString("en-GB")}</span>
                  </div>
                  <p className="text-xs text-gray-600">Method: {payment.paymentMethod}</p>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-green-600 font-semibold">Tap to view details</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full relative overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white relative">
              <button
                onClick={() => setSelectedPayment(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
              >
                ✕
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedPayment.paymentType}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <CurrencyRupeeIcon className="w-5 h-5" />
                    <span className="text-2xl font-bold">₹{selectedPayment.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Payment Method</h3>
                    <p className="text-gray-700">{selectedPayment.paymentMethod}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      {getStatusIcon(selectedPayment.status)}
                      Status
                    </h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Receipt Number</h3>
                  <p className="text-gray-700 font-mono text-sm">{selectedPayment.receiptNumber}</p>
                </div>

                {selectedPayment.transactionId && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Transaction ID</h3>
                    <p className="text-gray-700 font-mono text-sm">{selectedPayment.transactionId}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Payment Date
                  </h3>
                  <p className="text-gray-700">
                    {new Date(selectedPayment.paymentDate).toLocaleDateString("en-GB", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {selectedPayment.remarks && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Remarks</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedPayment.remarks}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Created by {selectedPayment.createdBy}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
