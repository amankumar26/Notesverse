import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Pencil, Trash2 } from 'lucide-react';

// 1. Add 'thumbnailUrl' and 'sellerId' to the list of props
const NoteCard = ({ id, title, author, price, subject, thumbnailUrl, sellerId, isOwner, onEdit, onDelete, sellerProfilePicture, currency }) => {
  const navigate = useNavigate();

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
  };

  const symbol = currencySymbols[currency] || "$";

  const handleBargain = (e) => {
    e.preventDefault(); // Prevent navigation to the note detail page
    e.stopPropagation();
    navigate("/chat", {
      state: {
        sellerId,
        sellerName: author,
        sellerProfilePicture,
        noteId: id,
        noteTitle: title,
        noteThumbnail: thumbnailUrl,
        notePrice: price,
        noteCurrency: currency,
        noteSubject: subject,
      }
    });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(id);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this note?")) {
      onDelete(id);
    }
  };

  return (
    <Link to={`/notes/${id}`} className="break-inside-avoid block mb-6 animate-fade-in">
      <div className="glass-panel rounded-xl overflow-hidden hover:scale-[1.02] hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300 group relative">

        {/* 2. Image container */}
        <div className="w-full h-52 bg-gray-800 relative overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`${title} preview`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-600">
              <span className="text-4xl font-bold opacity-20">NoteVerse</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F2937] via-transparent to-transparent opacity-60"></div>

          {/* Action Buttons */}
          {isOwner ? (
            <div className="absolute bottom-3 right-3 flex space-x-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0">
              <button
                onClick={handleEdit}
                className="bg-blue-600/90 hover:bg-blue-500 backdrop-blur-sm text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110"
                title="Edit Note"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600/90 hover:bg-red-500 backdrop-blur-sm text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110"
                title="Delete Note"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleBargain}
              className="absolute bottom-3 right-3 bg-green-600/90 hover:bg-green-500 backdrop-blur-sm text-white p-2.5 rounded-full shadow-lg z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 hover:scale-110"
              title="Bargain / Chat with Seller"
            >
              <MessageCircle size={18} />
            </button>
          )}
        </div>

        {/* 3. Details container */}
        <div className="p-5">
          <h3 className="font-bold text-lg mb-1 truncate text-white group-hover:text-blue-400 transition-colors">{title}</h3>
          <p className="text-sm text-gray-400 mb-4">by <span className="text-gray-300">{author}</span></p>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-full">
              {subject}
            </span>
            <span className="font-bold text-xl text-gradient">{symbol}{price}</span>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default NoteCard;