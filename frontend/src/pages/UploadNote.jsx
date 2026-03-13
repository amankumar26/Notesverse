import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/dashboard/Sidebar";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const UploadNote = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    subject: "",
    currency: "INR",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const { authUser, token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("currency", formData.currency);
    data.append("subject", formData.subject);
    data.append("noteFile", file);
    data.append("sellerId", authUser._id);

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/notes/upload`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to upload note");
      }

      setLoading(false);
      navigate("/my-notes"); // Redirect to my notes on success
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600/10 rounded-xl border border-blue-500/20">
              <UploadCloud className="text-blue-500" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Post Your Insights</h2>
              <p className="text-gray-400 mt-1">Transform your notes into assets and help fellow students.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-3 space-y-6">
              <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-400 mb-2">Note Title</label>
                  <input
                    type="text"
                    id="title"
                    placeholder="e.g., Advanced Quantum Mechanics Lecture 1"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-400 mb-2">Description</label>
                  <textarea
                    id="description"
                    placeholder="Describe what's included in these notes..."
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-400 mb-2">Subject Category</label>
                    <input
                      type="text"
                      id="subject"
                      placeholder="e.g., Physics"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label htmlFor="price" className="block text-sm font-semibold text-gray-400 mb-2">Price</label>
                      <input
                        type="number"
                        id="price"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        required
                      />
                    </div>
                    <div className="w-24">
                      <label htmlFor="currency" className="block text-sm font-semibold text-gray-400 mb-2">Currency</label>
                      <select
                        id="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-2 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="lg:col-span-2 space-y-6">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative h-full min-h-[400px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 ${
                  dragActive ? "border-blue-500 bg-blue-600/5 shadow-inner" : "border-white/10 bg-gray-900/30"
                }`}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                
                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div 
                      key="file-selected"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                        <FileText className="text-green-500" size={36} />
                      </div>
                      <p className="text-white font-bold max-w-[200px] truncate mx-auto">{file.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                        className="mt-6 text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 mx-auto"
                      >
                        <X size={16} /> Remove and Change
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="no-file"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                        <UploadCloud className="text-blue-500" size={36} />
                      </div>
                      <p className="text-white font-bold">Upload Note File</p>
                      <p className="text-gray-500 text-sm mt-2">PDF, Word, or JPG allowed</p>
                      <p className="text-xs text-blue-500/60 mt-4 px-4 py-1 rounded-full bg-blue-500/5 border border-blue-500/10">Browse or Drag & Drop</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
                  >
                    <AlertCircle size={18} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-600/20 transition-all transform active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Launching to Verse...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Publish Note</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default UploadNote;
