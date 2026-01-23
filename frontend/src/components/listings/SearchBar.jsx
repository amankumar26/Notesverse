// src/components/listings/SearchBar.jsx
import React from "react";
import { Search } from "lucide-react";

// The component now accepts props from the Listings page
const SearchBar = ({ searchTerm, setSearchTerm, onSearchSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        placeholder="Search for notes, subjects, or authors..."
        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        type="submit"
        className="absolute inset-y-0 left-0 pl-4 flex items-center"
      >
        <Search className="text-gray-400" />
      </button>
    </form>
  );
};

export default SearchBar;
