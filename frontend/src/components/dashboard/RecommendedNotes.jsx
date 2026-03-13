import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NoteCard from './NoteCard';
import { ArrowRight } from 'lucide-react';

const RecommendedNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const dummyNotes = [
        {
            _id: 'dummy1',
            title: 'Advanced Machine Learning Notes',
            seller: { fullName: 'Dr. Sarah Chen', _id: 'seller1', profilePicture: null },
            price: 25.0,
            subject: 'Computer Science',
            thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60',
            currency: 'USD',
        },
        {
            _id: 'dummy2',
            title: 'Modern Architectural Principles',
            seller: { fullName: 'Marco Rossi', _id: 'seller2', profilePicture: null },
            price: 15.0,
            subject: 'Architecture',
            thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60',
            currency: 'USD',
        },
        {
            _id: 'dummy3',
            title: 'Organic Chemistry II - Full Semester',
            seller: { fullName: 'Emily Stone', _id: 'seller3', profilePicture: null },
            price: 12.5,
            subject: 'Chemistry',
            thumbnailUrl: 'https://images.unsplash.com/photo-1532187863486-abf9d34345cd?w=800&auto=format&fit=crop&q=60',
            currency: 'USD',
        },
    ];

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/`);
                const data = await res.json();
                
                // Filter for valid notes (must have seller, title and subjects)
                const validNotes = Array.isArray(data) ? data.filter(n => n.title && n.seller && n.seller.fullName) : [];

                if (res.ok && validNotes.length > 0) {
                    setNotes(validNotes.slice(0, 3));
                } else {
                    setNotes(dummyNotes);
                }
            } catch (err) {
                console.error('Failed to fetch recommended notes', err);
                setNotes(dummyNotes);
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
