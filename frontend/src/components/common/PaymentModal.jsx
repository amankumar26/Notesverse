import React, { useState, useEffect } from "react";
import { X, Smartphone, Landmark, Copy, Check, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PaymentModal = ({ noteId, noteTitle, price, currency, onClose }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [error, setError] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/${noteId}/payment-details`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to fetch payment details");
                setPaymentDetails(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [noteId, token]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currencySymbols = {
        USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥", CAD: "C$", AUD: "A$",
    };
    const symbol = currencySymbols[currency] || "₹";

    if (!token) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1F2937] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-scale-up">
                {/* Header */}
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                    <div>
                        <h3 className="text-xl font-bold text-white">Purchase Note</h3>
                        <p className="text-sm text-gray-400 mt-1">Pay directly to the seller</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6 bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-blue-300 font-medium">Total Amount</p>
                            <p className="text-2xl font-bold text-white">{symbol}{price}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">For</p>
                            <p className="text-white font-medium truncate max-w-[150px]">{noteTitle}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-center py-4">{error}</div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-300 mb-2">Select a payment method:</p>

                            {/* UPI Option */}
                            {paymentDetails?.upiId && (
                                <button
                                    onClick={() => setSelectedMethod("upi")}
                                    className={`w-full flex items-center p-4 rounded-xl border transition-all ${selectedMethod === "upi"
                                        ? "bg-blue-600/20 border-blue-500 text-white"
                                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                                        }`}
                                >
                                    <div className="p-2 bg-purple-500/20 rounded-lg mr-4">
                                        <Smartphone className="text-purple-400" size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">Pay via UPI</p>
                                        <p className="text-sm opacity-70">Google Pay, PhonePe, Paytm</p>
                                    </div>
                                </button>
                            )}

                            {/* Bank Option */}
                            {paymentDetails?.bankDetails?.accountNumber && (
                                <button
                                    onClick={() => setSelectedMethod("bank")}
                                    className={`w-full flex items-center p-4 rounded-xl border transition-all ${selectedMethod === "bank"
                                        ? "bg-blue-600/20 border-blue-500 text-white"
                                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                                        }`}
                                >
                                    <div className="p-2 bg-green-500/20 rounded-lg mr-4">
                                        <Landmark className="text-green-400" size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">Bank Transfer</p>
                                        <p className="text-sm opacity-70">IMPS, NEFT</p>
                                    </div>
                                </button>
                            )}

                            {!paymentDetails?.upiId && !paymentDetails?.bankDetails?.accountNumber && (
                                <p className="text-center text-gray-500 py-4">
                                    This seller has not set up any payment methods yet. Please contact them via chat.
                                </p>
                            )}

                            {/* Selected Method Details */}
                            {selectedMethod === "upi" && (
                                <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-gray-700 animate-fade-in">
                                    <p className="text-sm text-gray-400 mb-2">Seller's UPI ID:</p>
                                    <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-gray-700">
                                        <span className="font-mono text-white">{paymentDetails.upiId}</span>
                                        <button
                                            onClick={() => handleCopy(paymentDetails.upiId)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-yellow-500/80 mt-3">
                                        * Open your UPI app and pay to this ID. Take a screenshot of the payment for reference.
                                    </p>
                                </div>
                            )}

                            {selectedMethod === "bank" && (
                                <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-gray-700 animate-fade-in space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Account Number</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-mono text-white">{paymentDetails.bankDetails.accountNumber}</p>
                                            <button onClick={() => handleCopy(paymentDetails.bankDetails.accountNumber)} className="text-gray-400 hover:text-white"><Copy size={14} /></button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">IFSC Code</p>
                                        <p className="font-mono text-white">{paymentDetails.bankDetails.ifscCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Account Holder</p>
                                        <p className="text-white">{paymentDetails.bankDetails.accountHolderName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Bank Name</p>
                                        <p className="text-white">{paymentDetails.bankDetails.bankName}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700 bg-gray-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-300 hover:text-white font-medium mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20"
                        onClick={() => {
                            alert("After payment, please send the screenshot to the seller via chat to receive your note.");
                            onClose();
                        }}
                    >
                        I Have Paid
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
