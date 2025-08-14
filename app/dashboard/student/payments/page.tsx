"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
      </div>

      {/* Payments Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {payments.map((payment) => (
          <div
            key={payment._id}
            className="border p-4 rounded shadow hover:shadow-lg cursor-pointer transition"
            onClick={() => setSelectedPayment(payment)}
          >
            <p className="font-semibold">{payment.paymentType}</p>
            <p className="text-gray-600">Amount: ₹{payment.amount}</p>
            <p className="text-gray-500 text-sm">{new Date(payment.paymentDate).toLocaleDateString("en-GB")}</p>
            <p className="text-sm text-gray-400">Status: {payment.status}</p>
          </div>
        ))}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96 relative">
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedPayment.paymentType}</h2>
            <p><strong>Amount:</strong> ₹{selectedPayment.amount}</p>
            <p><strong>Payment Method:</strong> {selectedPayment.paymentMethod}</p>
            {selectedPayment.transactionId && <p><strong>Transaction ID:</strong> {selectedPayment.transactionId}</p>}
            <p><strong>Receipt No:</strong> {selectedPayment.receiptNumber}</p>
            <p><strong>Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleDateString("en-GB")}</p>
            <p><strong>Status:</strong> {selectedPayment.status}</p>
            {selectedPayment.remarks && <p><strong>Remarks:</strong> {selectedPayment.remarks}</p>}
            <p><strong>Created By:</strong> {selectedPayment.createdBy}</p>
          </div>
        </div>
      )}
    </div>
  );
}
