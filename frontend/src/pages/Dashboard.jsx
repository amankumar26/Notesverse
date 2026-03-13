import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Avatar from "../components/common/Avatar";
import StatsOverview from "../components/dashboard/StatsOverview";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";
import RecommendedNotes from "../components/dashboard/RecommendedNotes";
import { useAuth } from "../context/AuthContext";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const Dashboard = () => {
  const { authUser, token, updateUser } = useAuth();

  const [stats, setStats] = useState({
    totalEarnings: "0",
    notesUploaded: "0",
    notesPurchased: "0",
    profileViews: "0"
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/get-stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setStats({
            totalEarnings: `₹${data.totalEarnings.toLocaleString()}`,
            notesUploaded: data.notesUploaded.toString(),
            notesPurchased: data.notesPurchased.toString(),
            profileViews: data.profileViews.toString()
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoadingStats(false);
      }
    };

    if (token) fetchStats();
  }, [token]);

  const [activities, setActivities] = useState([
    { id: 1, type: 'purchase', message: 'You purchased "Quantum Physics Notes"', time: '2 hours ago', emoji: '💰' },
    { id: 2, type: 'upload', message: 'You uploaded "Organic Chemistry"', time: '1 day ago', emoji: '📄' },
    { id: 3, type: 'sale', message: 'Someone bought your "Calculus II" note', time: '3 days ago', emoji: '🎉' },
    { id: 4, type: 'purchase', message: 'You purchased "History of Art"', time: '1 week ago', emoji: '📚' },
  ]);

  // Simulate live activity
  useEffect(() => {
    const names = ["Aarav", "Priya", "Rahul", "Ananya", "Vikram", "Neha", "Aditya", "Sneha", "Rohan", "Ishita", "Arjun", "Kavya", "Siddharth", "Meera"];
    const subjects = ["Physics", "Calculus", "History", "Biology", "Chemistry", "Literature", "Computer Science", "Economics", "Psychology"];
    const actions = [
      { type: 'upload', verb: 'uploaded', emoji: '🚀 📄 ✨' },
      { type: 'purchase', verb: 'bought', emoji: '💸 💰 🤑' },
      { type: 'sale', verb: 'reviewed', suffix: 'with 5 stars ⭐⭐⭐⭐⭐', emoji: '⭐ 🌟 ✨' },
      { type: 'download', verb: 'downloaded', emoji: '⬇️ 💾 📂' },
      { type: 'like', verb: 'liked', emoji: '❤️ 👍 😍' },
      { type: 'comment', verb: 'commented on', suffix: ': "Great notes! Very helpful."', emoji: '💬 💭 🗣️' },
      { type: 'share', verb: 'shared', emoji: '🔗 📢 🌐' },
      { type: 'achievement', verb: 'earned a badge in', emoji: '🏆 🥇 🎖️' },
      { type: 'trending', verb: 'is trending in', emoji: '🔥 📈 🚀' },
      { type: 'question', verb: 'asked a question about', emoji: '❓ 🤔 🧐' },
      { type: 'answer', verb: 'answered a question on', emoji: '💡 🧠 ⚡' }
    ];

    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      let message = `${randomName} ${randomAction.verb} "${randomSubject} Notes"`;
      if (randomAction.suffix) {
        message += ` ${randomAction.suffix}`;
      }

      const newActivity = {
        id: Date.now(),
        type: randomAction.type,
        message: message,
        time: 'Just now',
        emoji: randomAction.emoji
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 5));
    }, 5000); // Add new activity every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hasSeenTour = authUser?.hasSeenTour;

    if (authUser && !hasSeenTour) {
      const driverObj = driver({
        showProgress: true,
        popoverClass: 'driverjs-theme',
        steps: [
          {
            element: '#sidebar',
            popover: {
              title: 'Navigation Sidebar',
              description: 'Use this sidebar to navigate between your Dashboard, My Notes, Upload, Chat, and Settings.',
              side: "right",
              align: 'start'
            }
          },
          {
            element: '#stats-overview',
            popover: {
              title: 'Your Stats',
              description: 'Quickly see your earnings, uploads, and purchases at a glance.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#quick-actions',
            popover: {
              title: 'Quick Actions',
              description: 'Fast access to common tasks like uploading notes or checking messages.',
              side: "left",
              align: 'center'
            }
          },
          {
            element: '#recommended-notes',
            popover: {
              title: 'Recommended For You',
              description: 'Check out notes we think you might like.',
              side: "top",
              align: 'center'
            }
          }
        ],
        onDestroyStarted: async () => {
          if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
            driverObj.destroy();
            // Update backend
            try {
              await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/update-profile`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ hasSeenTour: true }),
              });

              // Update context and local storage
              if (updateUser) {
                updateUser({ hasSeenTour: true });
              }
            } catch (err) {
              console.error("Failed to update tour status", err);
            }
          }
        },
      });

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        driverObj.drive();
      }, 1000);
    }
  }, [authUser, token]);

  return (
    <div className="min-h-screen bg-[#111827] flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
        <div id="welcome-header" className="flex justify-between items-center mb-8 animate-slide-up">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Dashboard
            </h2>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              Welcome back, <span className="text-blue-400 font-medium">{authUser?.fullName || "User"}</span>
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                style={{ originX: 0.7, originY: 0.7, display: 'inline-block' }}
              >
                👋
              </motion.span>
              ! Here's what's happening.
            </p>
          </div>

          <Link to="/profile/me" className="block relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur-[2px]"></div>
            <Avatar
              src={authUser?.profilePicture}
              name={authUser?.fullName}
              size="md"
              className="relative border-2 border-white/20"
            />
          </Link>
        </div>

        {/* Stats Overview */}
        <div id="stats-overview" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <StatsOverview stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <RecentActivity activities={activities} />
          </div>

          {/* Quick Actions - Takes up 1 column */}
          <div id="quick-actions" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <QuickActions />
          </div>
        </div>

        {/* Recommended Notes */}
        <div id="recommended-notes" className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <RecommendedNotes />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
