import React, { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import SettingsSidebar from "../components/settings/SettingsSidebar";
import ProfileSettings from "../components/settings/ProfileSettings";
import AccountSettings from "../components/settings/AccountSettings";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-[#111827] flex">
      <Sidebar />
      <main className="flex-1 flex flex-col md:flex-row pt-16 md:pt-0 overflow-y-auto md:overflow-hidden">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 overflow-y-auto">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "account" && <AccountSettings />}
        </div>
      </main>
    </div>
  );
};

export default Settings;
