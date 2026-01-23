import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NoteCard from './NoteCard';
import { ArrowRight } from 'lucide-react';

const RecommendedNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch a few random notes or top rated notes
        // For now we'll just fetch from the main endpoint and slice it
        const fetchRecommended = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/`);
                const data = await res.json();
                if (res.ok) {
                    // Just take the first 3 for now
                    setNotes(data.slice(0, 3));
                }
            } catch (err) {
                console.error("Failed to fetch recommended notes", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommended();
    }, []);

    if (loading) return <div className="animate-pulse h-64 bg-gray-800/50 rounded-xl"></div>;

    return (
        <div className="mt-8">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white">Recommended For You</h3>
                    <p className="text-gray-400 text-sm mt-1">Based on your interests and recent views</p>
                </div>
                <Link to="/listings" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center transition-colors">
                    View All <ArrowRight size={16} className="ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                    <NoteCard
                        key={note._id}
                        id={note._id}
                        title={note.title}
                        author={note.seller.fullName}
                        sellerId={note.seller._id}
                        price={note.price.toFixed(2)}
                        subject={note.subject}
                        thumbnailUrl={note.thumbnailUrl}
                        sellerProfilePicture={note.seller.profilePicture}
                        currency={note.currency}
                    />
                ))}
                {notes.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                        No recommendations available yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendedNotes;
