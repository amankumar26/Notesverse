import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/dashboard/Sidebar";
import NoteCard from "../components/dashboard/NoteCard";
import { MapPin, Calendar, BookOpen, MessageCircle, Edit, User } from "lucide-react";

const UserProfile = () => {
    const { id } = useParams(); // userId from URL
    const { authUser, token } = useAuth();
    const navigate = useNavigate();

    const [profileUser, setProfileUser] = useState(null);
    const [userNotes, setUserNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("notes");

    const isOwnProfile = authUser && (authUser._id === id || id === "me");
    const profileId = isOwnProfile ? authUser._id : id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Fetch User Profile
                // If it's own profile, we might already have data in authUser, but fetching ensures freshness
                // However, if id is 'me', we use authUser._id
                const targetId = id === "me" ? authUser?._id : id;

                if (!targetId) return;

                const userRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/user/${targetId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!userRes.ok) throw new Error("Failed to fetch user profile");
                const userData = await userRes.json();
                setProfileUser(userData);

                // 2. Fetch User's Notes
                const notesRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/seller/${targetId}`);
                if (notesRes.ok) {
                    const notesData = await notesRes.json();
                    setUserNotes(notesData);
                }

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [id, token, authUser]);

    const handleMessage = () => {
        // Navigate to chat with this user
        // We need to pass state to initialize chat
        navigate("/chat", {
            state: {
                sellerId: profileUser._id,
                sellerName: profileUser.fullName,
                sellerProfilePicture: profileUser.profilePicture
            }
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-[#111827] flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#111827] flex items-center justify-center text-red-400">
            Error: {error}
        </div>
    );

    if (!profileUser) return null;

    return (
        <div className="min-h-screen bg-[#111827] flex">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative">
                {/* Cover Image Area */}
                <div className="h-64 bg-gradient-to-r from-blue-900 to-purple-900 relative">
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
                    {/* Profile Header Card */}
                    <div className="bg-[#1F2937] rounded-2xl shadow-xl border border-gray-700 p-6 mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#1F2937] overflow-hidden bg-gray-700 shadow-lg">
                                    {profileUser.profilePicture ? (
                                        <img src={profileUser.profilePicture} alt={profileUser.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                            {profileUser.fullName?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 mb-2">
                                <h1 className="text-3xl font-bold text-white mb-1">{profileUser.fullName}</h1>
                                <p className="text-blue-400 font-medium mb-3">{profileUser.college || "University Student"}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    {profileUser.major && (
                                        <div className="flex items-center">
                                            <BookOpen size={16} className="mr-1.5" />
                                            {profileUser.major}
                                        </div>
                                    )}
                                    {profileUser.gradYear && (
                                        <div className="flex items-center">
                                            <Calendar size={16} className="mr-1.5" />
                                            Class of {profileUser.gradYear}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-4 md:mt-0">
                                {isOwnProfile ? (
                                    <button
                                        onClick={() => navigate("/settings")}
                                        className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Edit size={18} className="mr-2" />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleMessage}
                                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                                    >
                                        <MessageCircle size={18} className="mr-2" />
                                        Message
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Bio Section */}
                        {profileUser.bio && (
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                                <p className="text-gray-300 leading-relaxed max-w-3xl">
                                    {profileUser.bio}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Content Tabs */}
                    <div className="mb-8 border-b border-gray-700">
                        <div className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab("notes")}
                                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "notes" ? "text-blue-400" : "text-gray-400 hover:text-gray-300"
                                    }`}
                            >
                                Notes ({userNotes.length})
                                {activeTab === "notes" && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full"></div>
                                )}
                            </button>
                            {/* Add more tabs like "Reviews" later */}
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "notes" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {userNotes.map((note) => (
                                <NoteCard
                                    key={note._id}
                                    id={note._id}
                                    title={note.title}
                                    author={profileUser.fullName}
                                    sellerId={profileUser._id}
                                    price={note.price.toFixed(2)}
                                    subject={note.subject}
                                    thumbnailUrl={note.thumbnailUrl}
                                    sellerProfilePicture={profileUser.profilePicture}
                                    currency={note.currency}
                                    isOwner={isOwnProfile}
                                // We don't pass onDelete/onEdit here unless we want to allow management from public profile
                                // Usually management is done in "My Notes", but we could enable it here for the owner
                                />
                            ))}
                            {userNotes.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                                        <User size={32} />
                                    </div>
                                    <p className="text-lg">No notes uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserProfile;
