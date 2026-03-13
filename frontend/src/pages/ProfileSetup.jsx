import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Step1_PersonalInfo from "../components/profile/Step1_PersonalInfo";
import Step2_AcademicInfo from "../components/profile/Step2_AcademicInfo";
import Step3_PayoutInfo from "../components/profile/Step3_PayoutInfo";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import particlesConfig from "../config/particlesjs-config.json";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, SkipForward } from "lucide-react";

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const navigate = useNavigate();
  const { token, updateUser } = useAuth();

  // Centralized State for all steps
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    college: "",
    major: "",
    gradYear: "",
    paypalEmail: "",
    profilePicture: null, // For file upload
  });

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: files ? files[0] : value,
    }));
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const saveProgress = async () => {
    try {
      // We mark as complete so they aren't forced back here on next login
      const updateBody = { ...formData, isProfileComplete: true };
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateBody),
      });

      if (res.ok) {
        const data = await res.json();
        if (updateUser) {
          updateUser({ isProfileComplete: true, ...data });
        }
      }
    } catch (error) {
      console.error("Failed to save partial progress", error);
    }
  };

  const nextStep = () => {
    // If they finish step 1, we mark them as "complete" so they don't get 
    // forced back here on every login.
    if (currentStep === 1) {
      saveProgress();
    }
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };

  const handleFinishSetup = async (isSkipping = false) => {
    try {
      // If skipping, we only update the flag. If finishing, we might want to send the data too.
      // For now, let's assume we send whatever data is collected + the flag.

      const updateBody = { ...formData, isProfileComplete: true };
      // Note: File upload needs FormData, but for simplicity/MVP we might skip complex file handling here 
      // or implement it properly. Given the previous code didn't handle it, I'll stick to JSON for text fields 
      // and assume image upload is handled separately or I'll add it if requested.
      // For now, let's just send the text data and the flag.

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(isSkipping ? { isProfileComplete: true } : updateBody),
      });

      if (res.ok) {
        const data = await res.json();
        // Update context (which handles localStorage automatically)
        if (updateUser) {
          updateUser({ isProfileComplete: true, ...data });
        }
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Failed to complete profile setup", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4 overflow-hidden">
      <Particles id="tsparticles" init={particlesInit} options={particlesConfig} className="absolute top-0 left-0 w-full h-full z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-400">Step {currentStep} of {totalSteps}</p>
          </div>

          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && <Step1_PersonalInfo formData={formData} handleChange={handleChange} />}
                {currentStep === 2 && <Step2_AcademicInfo formData={formData} handleChange={handleChange} />}
                {currentStep === 3 && <Step3_PayoutInfo formData={formData} handleChange={handleChange} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/10">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 rounded-xl transition-all ${currentStep === 1 ? "opacity-0 cursor-default" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <ChevronLeft size={20} className="mr-1" /> Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleFinishSetup(true)}
                className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium mr-2"
              >
                Skip for now <SkipForward size={16} className="ml-1" />
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all"
                >
                  Next <ChevronRight size={20} className="ml-1" />
                </button>
              ) : (
                <button
                  onClick={() => handleFinishSetup(false)}
                  className="flex items-center px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transform hover:-translate-y-0.5 transition-all"
                >
                  Finish <Check size={20} className="ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
