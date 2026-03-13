import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, ShieldCheck, Loader, CheckCircle, Smartphone, AlertCircle, QrCode, Copy, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import confetti from "canvas-confetti";

const PaymentModal = ({ isOpen, onClose, noteId, noteTitle, price, currency }) => {
    const { token, authUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Initial, 2: QR Code, 3: Success
    const [paymentData, setPaymentData] = useState(null);
    const [utr, setUtr] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setUtr("");
            setError("");
            setLoading(false);
        }
    }, [isOpen]);

    const handleInitiatePayment = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ noteId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to initiate payment");

            setPaymentData(data);

            if (data.method === "razorpay") {
                openRazorpay(data);
            } else {
                setStep(2);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openRazorpay = (data) => {
        const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: "NoteVerse",
            description: `Purchase: ${data.noteTitle}`,
            order_id: data.orderId,
            handler: async (response) => {
                setLoading(true);
                try {
                    const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/verify-payment`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(response),
                    });

                    if (verifyRes.ok) {
                        triggerSuccess();
                    } else {
                        throw new Error("Verification failed");
                    }
                } catch (err) {
                    setError("Payment verification failed. Please contact support.");
                } finally {
                    setLoading(false);
                }
            },
            prefill: {
                name: authUser?.fullName || "",
                email: authUser?.email || "",
            },
            theme: { color: "#3B82F6" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handleConfirmManualPayment = async () => {
        if (!utr || utr.length < 8) {
            setError("Please enter a valid Transaction ID / UTR (min 8 chars)");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/record-manual-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    noteId,
                    utr,
                    amount: paymentData?.amount
                }),
            });

            const manualResData = await res.json();
            if (res.ok) {
                triggerSuccess();
            } else {
                throw new Error(manualResData.error || "Failed to record payment");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const triggerSuccess = () => {
        setStep(3);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#3B82F6", "#8B5CF6", "#10B981"]
        });
        setTimeout(() => {
            onClose();
            navigate("/my-notes");
        }, 3000);
    };

    const copyUpiId = () => {
        if (paymentData?.upiId) {
            navigator.clipboard.writeText(paymentData.upiId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    const upiLink = paymentData?.upiId 
        ? `upi://pay?pa=${paymentData.upiId}&pn=NoteVerseSeller&am=${paymentData.amount}&cu=INR&tn=Notesverse-${noteTitle.substring(0, 20)}`
        : "";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md overflow-hidden glass-dark border border-white/10 rounded-3xl shadow-2xl"
                >
                    <div className="p-6 pb-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-blue-500" size={20} />
                            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Secure Checkout</span>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 pt-2">
                        {step === 1 && (
                            <div className="text-center">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">{noteTitle}</h3>
                                    <p className="text-gray-400 text-sm">Review your order details before proceeding to payment.</p>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-400">Amount to pay</span>
                                        <span className="text-3xl font-black text-white">₹{price}</span>
                                    </div>
                                    <div className="h-[1px] bg-white/10 mb-4" />
                                    <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                                        <ShieldCheck size={14} />
                                        <span>Fully encrypted SSL secure transaction</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleInitiatePayment}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                                >
                                    {loading ? <Loader className="animate-spin" /> : <Smartphone size={20} />}
                                    <span>{loading ? "Processing..." : "Proceed to Payment"}</span>
                                </button>
                                
                                {error && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                                        <AlertCircle size={14} /> {error}
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="text-center space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Scan & Pay via UPI</h3>
                                    <p className="text-xs text-blue-400 mt-1">Pay directly to the seller's UPI</p>
                                </div>

                                <div className="relative inline-block p-4 bg-white rounded-2xl shadow-xl">
                                    <QRCodeCanvas
                                        value={upiLink}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-[1px] rounded-2xl">
                                        <span className="bg-black/80 text-white text-[10px] px-2 py-1 rounded-full border border-white/20">Official QR</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 justify-center bg-gray-900/50 p-3 rounded-xl border border-white/5">
                                        <span className="text-gray-400 text-xs truncate max-w-[150px]">{paymentData?.upiId}</span>
                                        <button onClick={copyUpiId} className="text-blue-400 hover:text-white transition-colors">
                                            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>

                                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-left">
                                        <div className="flex items-start gap-3">
                                            <Info className="text-blue-400 mt-0.5" size={16} />
                                            <div>
                                                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Confirm Payment</p>
                                                <p className="text-blue-300 text-[10px] leading-relaxed">Scan with GPay/PhonePe and enter the 12-digit UTR/Ref No. below to unlock your note instantly.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Enter 12-digit UTR / Transaction ID"
                                            value={utr}
                                            onChange={(e) => setUtr(e.target.value)}
                                            className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                        <button
                                            onClick={handleConfirmManualPayment}
                                            disabled={loading || !utr}
                                            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:bg-gray-800 disabled:text-gray-600 transition-all"
                                        >
                                            {loading ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                            Confirm Submission
                                        </button>
                                        {error && <p className="text-red-400 text-[10px]">{error}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center py-10 space-y-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30"
                                >
                                    <CheckCircle className="text-green-500" size={48} />
                                </motion.div>
                                <div>
                                    <h3 className="text-2xl font-black text-white">Payment Successful!</h3>
                                    <p className="text-gray-400 mt-2">Your note is now ready for download.</p>
                                </div>
                                <div className="text-xs text-blue-400 animate-pulse">Redirecting to your library...</div>
                            </div>
                        )}
                    </div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/10 blur-[60px] rounded-full pointer-events-none" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;
