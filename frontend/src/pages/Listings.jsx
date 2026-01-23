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

  // Function to fetch notes, now accepts an optional query
  const fetchNotes = async (query = "") => {
    try {
      setLoading(true);
      setError(null);
      //extras
      // Determine which URL to use based on the search query
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = query
        ? `${baseUrl}/api/notes/search?q=${query}`
        : `${baseUrl}/api/notes/`;

      console.log(`Fetching notes from: ${url}`);
      //extras

      // const url = query
      //   ? `http://localhost:5000/api/notes/search?q=${query}`
      //   : "http://localhost:5000/api/notes/";

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch notes");
      }

      setNotes(data);
    } catch (err) {
      setError(err.message);
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
