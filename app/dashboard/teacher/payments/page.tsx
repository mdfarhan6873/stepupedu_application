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

      {/* Payments Grid */}
      {payments.length === 0 ? (
        <p className="text-gray-600">No payments found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer transition bg-white"
              onClick={() => setSelectedPayment(payment)}
            >
              <h2 className="text-lg font-semibold text-indigo-700">
                ₹{payment.amount}
              </h2>
              <p className="text-gray-600 text-sm">{payment.teacherName}</p>
              <p className="text-gray-500 text-xs mt-1">
                {formatDate(payment.paymentDate)}
              </p>
              <span
                className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                  payment.status.toLowerCase() === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {payment.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Payment Details Modal */}
      <Dialog
        open={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh]">
            {selectedPayment && (
              <>
                {/* Close Button */}
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Title */}
                <Dialog.Title className="text-xl font-bold mb-4 text-indigo-700">
                  Payment Details
                </Dialog.Title>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold">Teacher:</span>{" "}
                    {selectedPayment.teacherName} ({selectedPayment.mobileNo})
                  </div>
                  <div>
                    <span className="font-semibold">Amount:</span> ₹
                    {selectedPayment.amount}
                  </div>
                  <div>
                    <span className="font-semibold">Payment Type:</span>{" "}
                    {selectedPayment.paymentType}
                  </div>
                  <div>
                    <span className="font-semibold">Payment Date:</span>{" "}
                    {formatDate(selectedPayment.paymentDate)}
                  </div>
                  <div>
                    <span className="font-semibold">Payment Month:</span>{" "}
                    {selectedPayment.paymentMonth} /{" "}
                    {selectedPayment.paymentYear}
                  </div>
                  <div>
                    <span className="font-semibold">Method:</span>{" "}
                    {selectedPayment.paymentMethod}
                  </div>
                  {selectedPayment.transactionId && (
                    <div>
                      <span className="font-semibold">Transaction ID:</span>{" "}
                      {selectedPayment.transactionId}
                    </div>
                  )}
                  {selectedPayment.receiptNumber && (
                    <div>
                      <span className="font-semibold">Receipt No:</span>{" "}
                      {selectedPayment.receiptNumber}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    {selectedPayment.status}
                  </div>
                  {selectedPayment.remarks && (
                    <div>
                      <span className="font-semibold">Remarks:</span>{" "}
                      {selectedPayment.remarks}
                    </div>
                  )}
                  {selectedPayment.createdBy && (
                    <div>
                      <span className="font-semibold">Created By:</span>{" "}
                      {selectedPayment.createdBy}
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
