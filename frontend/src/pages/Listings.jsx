// src/pages/Listings.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import NoteCard from "../components/dashboard/NoteCard";
import SearchBar from "../components/listings/SearchBar";

const Listings = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for the search term

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
    {
      _id: 'dummy4',
      title: 'Macroeconomics 101: Key Concepts',
      seller: { fullName: 'John Doe', _id: 'seller4', profilePicture: null },
      price: 10.0,
      subject: 'Economics',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518186239767-3467f8142540?w=800&auto=format&fit=crop&q=60',
      currency: 'USD',
    },
  ];

  // Function to fetch notes, now accepts an optional query
  const fetchNotes = async (query = "") => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = query
        ? `${baseUrl}/api/notes/search?q=${query}`
        : `${baseUrl}/api/notes/`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch notes");
      }

      // Filter for valid notes
      const validNotes = Array.isArray(data) ? data.filter(n => n.title && n.seller && n.seller.fullName) : [];

      if (validNotes.length === 0 && !query) {
        setNotes(dummyNotes);
      } else {
        setNotes(validNotes);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (!query) {
        setNotes(dummyNotes);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all notes when the component first loads
  useEffect(() => {
    fetchNotes();
  }, []);

  // Function to be called when the search form is submitted
  const handleSearchSubmit = () => {
    fetchNotes(searchTerm);
  };

  return (
    <div className="min-h-screen bg-[#111827] flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Explore Marketplace
          </h2>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>

        {/* ... (rest of the JSX is the same) ... */}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          </div>
        )}

        {!loading && !error && notes.length === 0 && (
          <p className="text-gray-400 text-center text-lg">
            {searchTerm
              ? `No results found for "${searchTerm}"`
              : "No notes have been uploaded yet."}
          </p>
        )}
      </main>
    </div>
  );
};

export default Listings;
