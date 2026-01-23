import React from "react";
import { CreditCard } from "lucide-react";

const Step3_PayoutInfo = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-green-500/20 rounded-full">
          <CreditCard className="text-green-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Payout Information</h3>
          <p className="text-sm text-gray-400">Secure payments via PayPal</p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-200">
          This is how you'll get paid when you sell your notes. We use PayPal for secure and fast transactions.
        </p>
      </div>

      <div>
        <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-300 mb-2 ml-1">
          PayPal Email
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CreditCard className="h-5 w-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
          </div>
          <input
            type="email"
            id="paypalEmail"
            value={formData.paypalEmail || ""}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all hover:bg-black/30"
            placeholder="you@example.com"
          />
        </div>
      </div>
    </div>
  );
};

export default Step3_PayoutInfo;
