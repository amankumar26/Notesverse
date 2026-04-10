import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Pencil, Trash2, BookOpen, User } from 'lucide-react';
import { motion } from 'framer-motion';

const NoteCard = ({ id, title, author, price, subject, thumbnailUrl, sellerId, isOwner, onEdit, onDelete, sellerProfilePicture, currency }) => {
  const navigate = useNavigate();

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
  };

  const symbol = currencySymbols[currency] || "₹";

  const handleBargain = (e) => {
    e.preventDefault();
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/notes/${id}`} className="block">
        <div className="glass-card rounded-2xl overflow-hidden relative">
          {/* Image/Thumbnail Section */}
          <div className="relative h-48 overflow-hidden bg-slate-800">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-slate-700 group-hover:to-slate-800 transition-all">
                <BookOpen className="w-12 h-12 text-slate-600 opacity-40" />
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Price Badge */}
            <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full shadow-xl">
              <span className="text-sm font-bold text-white">
                {symbol}{price}
              </span>
            </div>

            {/* Actions on Hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {isOwner ? (
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(id); }}
                    className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-110"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(id); }}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-full text-red-400 transition-all transform hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleBargain}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-blue-600/20"
                >
                  <MessageCircle size={16} />
                  Bargain
                </button>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase bg-blue-400/10 px-2 py-0.5 rounded">
                {subject}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
              {title}
            </h3>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-700 overflow-hidden border border-white/10">
                  {sellerProfilePicture ? (
                    <img src={sellerProfilePicture} alt={author} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={12} className="text-slate-500" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-medium">{author}</span>
              </div>
              
              <div className="flex items-center gap-1 text-slate-500">
                <BookOpen size={12} />
                <span className="text-[10px]">PREMIUM</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default NoteCard;