import React from "react";
import { User, FileText, Image } from "lucide-react";

const Step1_PersonalInfo = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-full">
          <User className="text-blue-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Personal Information</h3>
          <p className="text-sm text-gray-400">Tell us a bit about yourself</p>
        </div>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2 ml-1">
          Full Name
        </label>
        <div className="relative group">
          <input
            type="text"
            id="fullName"
            value={formData.fullName || ""}
            onChange={handleChange}
            className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all hover:bg-black/30"
            placeholder="John Doe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2 ml-1">
          Your Bio
        </label>
        <div className="relative group">
          <textarea
            id="bio"
            rows="3"
            value={formData.bio || ""}
            onChange={handleChange}
            className="block w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all hover:bg-black/30 resize-none"
            placeholder="e.g., Computer Science student passionate about AI."
          ></textarea>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
          Profile Picture
        </label>
        <div className="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl hover:border-blue-500/50 hover:bg-white/5 transition-all cursor-pointer group">
          <Image className="text-gray-500 group-hover:text-blue-400 mb-2 transition-colors" size={24} />
          <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
            Click to upload or drag and drop
          </p>
          <input type="file" id="profilePicture" onChange={handleChange} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default Step1_PersonalInfo;
