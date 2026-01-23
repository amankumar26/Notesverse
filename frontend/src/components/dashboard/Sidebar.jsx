import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Compass,
  MessageSquare,
  ShoppingCart,
  Upload,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const pathname = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/listings", label: "Explore", icon: Compass },
    { href: "/chat", label: "Chats", icon: MessageSquare },
    { href: "/purchases", label: "My Purchases", icon: ShoppingCart },
    { href: "/upload-note", label: "Upload Note", icon: Upload },
    { href: "/my-notes", label: "My Notes", icon: User },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-dark p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div>
          <h1 className="text-3xl font-extrabold mb-10 pl-2 md:pl-0 tracking-tight">
            <span className="text-gradient">NoteVerse</span>
          </h1>
          <nav className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${pathname === link.href
                  ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
                  }`}
              >
                <link.icon className={`mr-3 h-5 w-5 ${pathname === link.href ? "text-white" : "text-gray-400 group-hover:text-blue-400 transition-colors"}`} />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="space-y-3">
          <Link
            to="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${pathname === "/settings"
              ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white shadow-lg shadow-blue-500/20"
              : "text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
              }`}
          >
            <Settings className={`mr-3 h-5 w-5 ${pathname === "/settings" ? "text-white" : "text-gray-400 group-hover:text-blue-400 transition-colors"}`} />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center text-gray-400 hover:bg-red-500/10 hover:text-red-400 px-4 py-3 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="mr-3 h-5 w-5 group-hover:text-red-400 transition-colors" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
