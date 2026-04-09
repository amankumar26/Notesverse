import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import NoteCard from "../components/dashboard/NoteCard";
import SearchBar from "../components/listings/SearchBar";
import { Filter, ChevronDown, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Listings = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    course: "",
    category: "",
    semester: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "",
  });

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

  const fetchNotes = async (query = "", currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const params = new URLSearchParams();
      
      if (query) params.append("q", query);
      if (currentFilters.course) params.append("course", currentFilters.course);
      if (currentFilters.category) params.append("category", currentFilters.category);
      if (currentFilters.semester) params.append("semester", currentFilters.semester);
      if (currentFilters.minPrice) params.append("minPrice", currentFilters.minPrice);
      if (currentFilters.maxPrice) params.append("maxPrice", currentFilters.maxPrice);
      if (currentFilters.sortBy) params.append("sortBy", currentFilters.sortBy);

      const endpoint = query ? "/api/notes/search" : "/api/notes";
      const url = `${baseUrl}${endpoint}?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch notes");
      }

      const validNotes = Array.isArray(data) ? data.filter(n => n.title && n.seller && n.seller.fullName) : [];

      if (validNotes.length === 0 && !query && !Object.values(currentFilters).some(v => v)) {
        setNotes(dummyNotes);
      } else {
        setNotes(validNotes);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (!query && !Object.values(currentFilters).some(v => v)) {
        setNotes(dummyNotes);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSearchSubmit = () => {
    fetchNotes(searchTerm, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchNotes(searchTerm, newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      course: "",
      category: "",
      semester: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "",
    };
    setFilters(defaultFilters);
    fetchNotes(searchTerm, defaultFilters);
  };

  const courseOptions = ["B.Tech", "B.Com", "B.Sc", "BBA", "BA", "MBA", "M.Tech"];
  const categoryOptions = [
    { value: "notes", label: "Notes" },
    { value: "previous_year_paper", label: "Previous Papers" },
    { value: "research_paper", label: "Research Papers" }
  ];

  return (
    <div className="min-h-screen bg-[#111827] flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex-1">
              <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
                Explore Marketplace
              </h2>
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onSearchSubmit={handleSearchSubmit}
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 bg-gray-900 border ${showFilters ? 'border-blue-500 text-blue-500' : 'border-white/10 text-gray-400'} rounded-xl hover:bg-black/40 transition-all flex items-center gap-2`}
                >
                  <Filter size={18} />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Course Filter */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Subject Course</label>
                    <select 
                      value={filters.course}
                      onChange={(e) => handleFilterChange('course', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">All Courses</option>
                      {courseOptions.map(course => <option key={course} value={course}>{course}</option>)}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Resource Type</label>
                    <select 
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">All Types</option>
                      {categoryOptions.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Price Range (₹)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <span className="text-gray-600">-</span>
                      <input 
                        type="number" 
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  {/* Sorting & Reset */}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Sort By</label>
                      <select 
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="">Newest</option>
                        <option value="priceLowHigh">Price: Low to High</option>
                        <option value="priceHighLow">Price: High to Low</option>
                      </select>
                    </div>
                    <button 
                      onClick={resetFilters}
                      className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
                      title="Reset Filters"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[300px] bg-gray-900/50 rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
              <p className="text-red-400">{error}</p>
              <button onClick={() => fetchNotes()} className="mt-4 text-sm font-bold text-blue-500 hover:underline">Try again</button>
            </div>
          ) : (
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
            <div className="bg-gray-900/30 border border-dashed border-white/10 rounded-3xl p-16 text-center">
              <p className="text-gray-500 text-lg">
                {searchTerm || Object.values(filters).some(v => v)
                  ? `No results match your current search and filters.`
                  : "No notes have been uploaded yet."}
              </p>
              <button onClick={resetFilters} className="mt-4 text-blue-500 font-bold hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default Listings;
