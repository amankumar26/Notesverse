import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import NoteCard from "../components/dashboard/NoteCard";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Loader2 } from "lucide-react";

const MyPurchases = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/purchased`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch purchases");
                }

                setNotes(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchPurchases();
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-[#111827] flex">
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto relative">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-600/10 rounded-xl border border-blue-500/20">
                        <ShoppingBag className="text-blue-500" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">My Purchases</h2>
                        <p className="text-gray-400 text-sm mt-1">Access all your purchased notes in one place</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh]">
                        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                        <p className="text-gray-400 animate-pulse">Loading your collection...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
                        <p className="text-red-400 font-medium">Error: {error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {notes.map((note) => (
                                <NoteCard
                                    key={note._id}
                                    id={note._id}
                                    title={note.title}
                                    author={note.seller?.fullName || "Unknown"}
                                    price={note.price.toFixed(2)}
                                    subject={note.subject}
                                    thumbnailUrl={note.thumbnailUrl}
                                    sellerId={note.seller?._id || note.seller}
                                    sellerProfilePicture={note.seller?.profilePicture}
                                    currency={note.currency}
                                    isPurchased={true}
                                />
                            ))}
                        </div>

                        {notes.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                    <ShoppingBag className="text-gray-600" size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No purchases yet</h3>
                                <p className="text-gray-400 max-w-sm mb-6">
                                    Browse the marketplace to find high-quality notes from top students.
                                </p>
                                <a 
                                    href="/listings" 
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                                >
                                    Explore Listings
                                </a>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default MyPurchases;
