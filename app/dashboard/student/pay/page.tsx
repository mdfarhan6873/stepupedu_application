"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { QrCode, Copy, CreditCard, AlertTriangle, CheckCircle, X, ExternalLink, FileText, Clock, ArrowLeft } from 'lucide-react';

interface Institute {
    name: string;
    upiId: string;
    qrCode: string;
    address: string;
    phone: string;
    email: string;
}

const Pay = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [institute, setInstitute] = useState<Institute | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    useEffect(() => {
        fetchInstituteDetails();
    }, []);

    const fetchInstituteDetails = async () => {
        try {
            const response = await fetch('/api/institute');
            if (response.ok) {
                const data = await response.json();
                setInstitute(data.institute);
            } else {
                console.error('Failed to fetch institute details');
            }
        } catch (error) {
            console.error('Error fetching institute details:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const generateQRCode = (upiId: string, payeeName: string) => {
        // Create proper UPI QR code data
        const upiData = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&cu=INR`;
        // Using a QR code generation service (you can replace with your preferred service)
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiData)}`;
    };

    const handlePayment = () => {
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        setPaymentProcessing(true);

        // Create proper UPI payment URL with amount and transaction note
        const upiUrl = `upi://pay?pa=${institute?.upiId}&pn=${encodeURIComponent(institute?.name || '')}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Fee Payment - ${session?.user?.name || 'Student'}`)}`;

        // Try to open UPI apps
        try {
            window.location.href = upiUrl;
        } catch (error) {
            console.error('Error opening UPI app:', error);
            alert('Unable to open UPI app. Please copy the UPI ID and pay manually.');
        }

        // Simulate processing time
        setTimeout(() => {
            setPaymentProcessing(false);
            setShowPaymentModal(false);
            setAmount('');
        }, 2000);
    };

    const openPaymentModal = () => {
        setShowPaymentModal(true);
        setAmount('');
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setAmount('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (!institute) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Failed to load payment details</p>
                </div>
            </div>
        );
    }

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
                    <div className="text-center">
                        <CreditCard className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900">Fee Payment</h1>
                        <p className="text-gray-600 mt-2">Pay your fees securely using UPI</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* QR Code Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <QrCode className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Scan QR Code</h2>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg mb-4">
                                <img
                                    src={generateQRCode(institute.upiId, institute.name)}
                                    alt="Payment QR Code"
                                    className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900">UPI ID</p>
                                        <p className="text-blue-800 font-mono">{institute.upiId}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(institute.upiId)}
                                        className="ml-2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                                        title="Copy UPI ID"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                {copySuccess && (
                                    <div className="flex items-center space-x-1 mt-2 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm">Copied to clipboard!</span>
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Instructions</h2>

                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-yellow-900">Before Payment</h3>
                                        <p className="text-yellow-800 text-sm mt-1">
                                            Please verify the institute name "<strong>{institute.name}</strong>" before making any payment.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-medium text-gray-900">How to Pay:</h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                    <li>Scan the QR code shown above using your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                                    <li>Or copy the UPI ID and paste it in your UPI app</li>
                                    <li>Enter the fee amount and complete the payment</li>
                                    <li>Take a screenshot of the successful transaction</li>
                                    <li>Submit the screenshot xerox to the institute to update your payment details</li>
                                </ol>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <FileText className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-red-900">After Payment</h3>
                                        <p className="text-red-800 text-sm mt-1">
                                            Submit your transaction screenshot and update your payment status by visiting the institute as soon as possible.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-2">Institute Contact</h3>
                                <div className="space-y-1 text-sm text-gray-700">
                                    <p><strong>Address:</strong> {institute.address}</p>
                                    <p><strong>Phone:</strong> {institute.phone}</p>
                                    <p><strong>Email:</strong> {institute.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

        </div>
    );
};

export default Pay;