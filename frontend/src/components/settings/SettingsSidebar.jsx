import React from "react";
import { User, Shield } from "lucide-react";

const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-full md:w-1/4 bg-[#1F2937]/80 backdrop-blur-sm border-b md:border-b-0 md:border-r border-gray-700 p-6">
      <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
      <nav className="space-y-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === "profile"
            ? "bg-blue-600/30 text-white"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
            }`}
        >
          <User className="mr-3 h-5 w-5" />
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === "account"
            ? "bg-blue-600/30 text-white"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
            }`}
        >
          <Shield className="mr-3 h-5 w-5" />
          Account
        </button>
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
