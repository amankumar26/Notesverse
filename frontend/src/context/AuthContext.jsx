// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Create the Context
const AuthContext = createContext();

// 2. Create a custom hook for easy access to the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Create the Provider component
export const AuthProvider = ({ children }) => {
  // State to hold the authenticated user and their token
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // To check initial auth status

  // Effect to run when the component mounts (app first loads)
  useEffect(() => {
    // Check localStorage for existing session data
    const storedUser = localStorage.getItem("noteverse_user");
    const storedToken = localStorage.getItem("noteverse_token");

    if (storedUser && storedToken) {
      setAuthUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false); // Finished checking
  }, []); // The empty array [] means this effect runs only once

  // Function to handle user login
  const login = (userData, userToken) => {
    setAuthUser(userData);
    setToken(userToken);
    localStorage.setItem("noteverse_user", JSON.stringify(userData));
    localStorage.setItem("noteverse_token", userToken);
  };

  // Function to handle user logout
  const logout = () => {
    setAuthUser(null);
    setToken(null);
    localStorage.removeItem("noteverse_user");
    localStorage.removeItem("noteverse_token");
  };

  // Function to update user data without full re-login
  const updateUser = (updates) => {
    setAuthUser((prevUser) => {
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem("noteverse_user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // The value provided to all children components
  const value = {
    authUser,
    token,
    login,
    logout,
    updateUser,
  };

  // We don't render anything until we've checked for an existing session
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
