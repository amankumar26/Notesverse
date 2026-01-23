import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Trash2, Shield, Landmark, Smartphone, Save, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AccountSettings = () => {
    const { authUser, token, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const [payoutData, setPayoutData] = useState({
        upiId: "",
        bankDetails: {
            accountNumber: "",
            ifscCode: "",
            accountHolderName: "",
            bankName: ""
        }
    });

    const [showBankForm, setShowBankForm] = useState(false);

    useEffect(() => {
        if (authUser) {
            setPayoutData({
                upiId: authUser.upiId || "",
                bankDetails: {
                    accountNumber: authUser.bankDetails?.accountNumber || "",
                    ifscCode: authUser.bankDetails?.ifscCode || "",
                    accountHolderName: authUser.bankDetails?.accountHolderName || "",
                    bankName: authUser.bankDetails?.bankName || ""
                }
            });

            // If bank details exist, show the form
            if (authUser.bankDetails?.accountNumber) {
                setShowBankForm(true);
            }
        }
    }, [authUser]);

    const handleUpiChange = (e) => {
        setPayoutData({ ...payoutData, upiId: e.target.value });
    };

    const handleBankChange = (e) => {
        setPayoutData({
            ...payoutData,
            bankDetails: {
                ...payoutData.bankDetails,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payoutData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update settings");
            }

            login(data, token);
            setMessage({ type: "success", text: "Payout details updated successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 w-full max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Account & Payouts</h2>
                <p className="text-gray-400 mt-1">Manage how you get paid and your security preferences.</p>
            </div>

            {message && (
                <div
                    className={`p-4 mb-6 rounded-xl border flex items-center animate-fade-in ${message.type === "success"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Payout Methods Section */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 mb-8">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                    <Landmark className="mr-2 text-blue-400" size={20} />
                    Payout Methods
                </h3>

                <div className="space-y-6">
                    {/* UPI Section */}
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                        <div className="flex items-center mb-4">
                            <Smartphone className="text-purple-400 mr-2" size={20} />
                            <h4 className="font-medium text-white">UPI (Unified Payments Interface)</h4>
                        </div>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="e.g. username@okhdfcbank"
                                value={payoutData.upiId}
                                onChange={handleUpiChange}
                                className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Payments will be sent directly to this UPI ID.</p>
                    </div>

                    {/* Bank Transfer Section */}
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <Landmark className="text-green-400 mr-2" size={20} />
                                <h4 className="font-medium text-white">Bank Transfer</h4>
                            </div>
                            <button
                                onClick={() => setShowBankForm(!showBankForm)}
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                {showBankForm ? "Hide Details" : "Show Details"}
                            </button>
                        </div>

                        {showBankForm && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">Account Holder Name</label>
                                    <input
                                        type="text"
                                        name="accountHolderName"
                                        value={payoutData.bankDetails.accountHolderName}
                                        onChange={handleBankChange}
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Account Number</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={payoutData.bankDetails.accountNumber}
                                        onChange={handleBankChange}
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">IFSC / Routing Code</label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        value={payoutData.bankDetails.ifscCode}
                                        onChange={handleBankChange}
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">Bank Name</label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={payoutData.bankDetails.bankName}
                                        onChange={handleBankChange}
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                            Save Payout Details
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                    <Shield className="mr-2 text-red-400" size={20} />
                    Security
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                        <div>
                            <p className="text-white font-medium">Change Password</p>
                            <p className="text-sm text-gray-400">Update your password regularly to keep your account secure.</p>
                        </div>
                        <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">Update</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
