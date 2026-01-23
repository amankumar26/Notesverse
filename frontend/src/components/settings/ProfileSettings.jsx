import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Camera, User, BookOpen, Save, Loader, Trash2 } from "lucide-react";

const ProfileSettings = () => {
    const { authUser, token, login } = useAuth();
    const [formData, setFormData] = useState({
        fullName: "",
        bio: "",
        college: "",
        major: "",
        gradYear: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (authUser) {
            setFormData({
                fullName: authUser.fullName || "",
                bio: authUser.bio || "",
                college: authUser.college || "",
                major: authUser.major || "",
                gradYear: authUser.gradYear || "",
            });
            setPreviewUrl(authUser.profilePicture || null);
        }
    }, [authUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveProfilePicture = async () => {
        // If user is just removing a preview of a file they just selected but haven't saved
        if (selectedFile) {
            setSelectedFile(null);
            setPreviewUrl(authUser.profilePicture || null);
            return;
        }

        // If user is removing their actual saved profile picture
        if (!confirm("Are you sure you want to remove your profile picture?")) return;

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/remove-profile-picture`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to remove profile picture");

            login(data, token);
            setPreviewUrl(null);
            setMessage({ type: "success", text: "Profile picture removed successfully" });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const data = new FormData();
            data.append("fullName", formData.fullName);
            data.append("bio", formData.bio);
            data.append("college", formData.college);
            data.append("major", formData.major);
            data.append("gradYear", formData.gradYear);

            if (selectedFile) {
                data.append("profilePicture", selectedFile);
            }

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/update-profile`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: data,
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || "Failed to update profile");
            }

            login(responseData, token);
            setMessage({ type: "success", text: "Profile updated successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h2>
                    <p className="text-gray-400 mt-1">Manage your public profile and account details.</p>
                </div>
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

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Picture Card */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Camera className="mr-2 text-blue-400" size={20} />
                        Profile Picture
                    </h3>
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer w-28 h-28">
                            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-700 border-4 border-gray-600 shadow-xl">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Profile Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold">
                                        {formData.fullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                <Camera className="text-white" size={28} />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        <div>
                            <p className="text-white font-medium">Upload a new photo</p>
                            <p className="text-sm text-gray-400 mt-1 mb-3">Recommended size: 400x400px. JPG, PNG or GIF.</p>

                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemoveProfilePicture}
                                    className="flex items-center text-xs text-red-400 hover:text-red-300 transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20"
                                >
                                    <Trash2 size={14} className="mr-1.5" />
                                    Remove Photo
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Personal Info Card */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <User className="mr-2 text-purple-400" size={20} />
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
                            <textarea
                                id="bio"
                                rows="4"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                                placeholder="Tell us a bit about yourself..."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1 text-right">{formData.bio.length}/500 characters</p>
                        </div>
                    </div>
                </div>

                {/* Academic Info Card */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <BookOpen className="mr-2 text-green-400" size={20} />
                        Academic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label htmlFor="college" className="block text-sm font-medium text-gray-400 mb-1.5">College / University</label>
                            <input
                                type="text"
                                id="college"
                                value={formData.college}
                                onChange={handleChange}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                placeholder="e.g. Stanford University"
                            />
                        </div>

                        <div>
                            <label htmlFor="major" className="block text-sm font-medium text-gray-400 mb-1.5">Major</label>
                            <input
                                type="text"
                                id="major"
                                value={formData.major}
                                onChange={handleChange}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                placeholder="e.g. Computer Science"
                            />
                        </div>

                        <div>
                            <label htmlFor="gradYear" className="block text-sm font-medium text-gray-400 mb-1.5">Graduation Year</label>
                            <input
                                type="text"
                                id="gradYear"
                                value={formData.gradYear}
                                onChange={handleChange}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                placeholder="e.g. 2025"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-8 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin mr-2" size={20} />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2" size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;