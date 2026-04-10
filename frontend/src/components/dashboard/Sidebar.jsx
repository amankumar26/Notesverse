import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Compass,
  MessageSquare,
  ShoppingCart,
  Upload,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const { authUser, logout } = useAuth();
  const pathname = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/listings", label: "Marketplace", icon: Compass },
    { href: "/chat", label: "Messages", icon: MessageSquare },
    { href: "/purchases", label: "Library", icon: ShoppingCart },
    { href: "/my-notes", label: "My Content", icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass z-50 px-4 flex items-center justify-between border-b border-white/5">
        <h1 className="text-xl font-display font-bold text-gradient">NoteVerse</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0d1221] border-r border-white/5 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="p-8">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-105 transition-transform">
              <BookOpen className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-white">
              Note<span className="text-blue-500">Verse</span>
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
          <div className="px-4 py-2 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</span>
          </div>
          
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <link.icon size={20} className={isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"} />
                <span className="font-semibold text-sm">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                )}
              </Link>
            );
          })}

          <div className="pt-8 px-4 py-2 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</span>
          </div>
          
          <Link
            to="/upload-note"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span className="font-bold text-sm">Upload New Note</span>
          </Link>
        </nav>

        {/* Footer / Profile */}
        <div className="p-4 border-t border-white/5 bg-slate-900/20">
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all group ${
              pathname === "/settings" ? "bg-white/5 text-white" : "text-slate-500 hover:text-white"
            }`}
          >
            <Settings size={20} />
            <span className="font-medium text-sm">Settings</span>
          </Link>
          
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-400">
                {authUser?.fullName?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white line-clamp-1">{authUser?.fullName || "User"}</span>
                <span className="text-[10px] text-slate-500">Premium Pro</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

