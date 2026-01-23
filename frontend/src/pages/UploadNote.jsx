import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/dashboard/Sidebar";
import { UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UploadNote = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    subject: "",
    currency: "USD",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { authUser, token } = useAuth(); // Get the logged-in user
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Get the first selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    // We use FormData because we are sending a file
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("currency", formData.currency);
    data.append("subject", formData.subject);
    data.append("noteFile", file); // 'noteFile' must match the backend (upload.single('noteFile'))
    data.append("sellerId", authUser._id); // Add the seller's ID

    try {
      //extras
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/notes/upload`;

      const res = await fetch(
        apiUrl,
        //extras
        // const res = await fetch("http://localhost:5000/api/notes/upload",
        {
          method: "POST",
          headers: {
            // Add the Authorization header with the JWT
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to upload note");
      }

      setLoading(false);
      navigate("/listings"); // Redirect to listings page on success
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-white mb-8">Upload New Note</h2>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-[#1F2937]/80 backdrop-blur-sm p-8 rounded-lg border border-gray-700 space-y-6"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 rounded-md p-2 text-white border border-gray-600"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 w-full bg-gray-800 rounded-md p-2 text-white border border-gray-600"
              required
            ></textarea>
          </div>

          <div className="flex space-x-4">
            <div className="w-1/3">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-300"
              >
                Price
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-800 rounded-md p-2 text-white border border-gray-600"
                required
              />
            </div>
            <div className="w-1/3">
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-300"
              >
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-800 rounded-md p-2 text-white border border-gray-600"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
            <div className="w-1/3">
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-300"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-800 rounded-md p-2 text-white border border-gray-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Note File (PDF, DOC, DOCX)
            </label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-500">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 px-2"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                {file && (
                  <p className="text-xs text-gray-400 mt-2">{file.name}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Note"}
            </button>
          </div>

          {error && <p className="text-red-400 text-center">{error}</p>}
        </form>
      </main>
    </div>
  );
};

export default UploadNote;
