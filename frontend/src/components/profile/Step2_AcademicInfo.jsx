import React from "react";
import { GraduationCap, BookOpen, Calendar } from "lucide-react";

const Step2_AcademicInfo = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-full">
          <GraduationCap className="text-purple-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Academic Information</h3>
          <p className="text-sm text-gray-400">Help us customize your experience</p>
        </div>
      </div>

      <div>
        <label htmlFor="college" className="block text-sm font-medium text-gray-300 mb-2 ml-1">
          College or University
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GraduationCap className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            type="text"
            id="college"
            value={formData.college || ""}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all hover:bg-black/30"
            placeholder="University of Technology"
          />
        </div>
      </div>

      <div>
        <label htmlFor="major" className="block text-sm font-medium text-gray-300 mb-2 ml-1">
          Major
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BookOpen className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            type="text"
            id="major"
            value={formData.major || ""}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all hover:bg-black/30"
            placeholder="Computer Science"
          />
        </div>
      </div>

      <div>
        <label htmlFor="gradYear" className="block text-sm font-medium text-gray-300 mb-2 ml-1">
          Expected Graduation Year
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            type="text"
            id="gradYear"
            value={formData.gradYear || ""}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all hover:bg-black/30"
            placeholder="2027"
          />
        </div>
      </div>
    </div>
  );
};

export default Step2_AcademicInfo;
