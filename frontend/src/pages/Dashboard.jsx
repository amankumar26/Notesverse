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
import { Sparkles, Bell } from "lucide-react";

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
              title: 'Navigation Workspace',
              description: 'Access your content, marketplace, and messaging hub from here.',
              side: "right",
              align: 'start'
            }
          },
          {
            element: '#stats-overview',
            popover: {
              title: 'Performance Insights',
              description: 'Monitor your earnings and engagement metrics in real-time.',
              side: "bottom",
              align: 'start'
            }
          }
        ],
        onDestroyStarted: async () => {
          if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
            driverObj.destroy();
            try {
              await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/update-profile`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ hasSeenTour: true }),
              });
              if (updateUser) {
                updateUser({ hasSeenTour: true });
              }
            } catch (err) {
              console.error("Failed to update tour status", err);
            }
          }
        },
      });

      setTimeout(() => {
        driverObj.drive();
      }, 1500);
    }
  }, [authUser, token]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto scrollbar-hide">
        <div className="max-w-[1400px] mx-auto p-6 md:p-10 pt-20 md:pt-10">
          
          {/* Header Section */}
          <div id="welcome-header" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                <Sparkles size={14} />
                <span>Overview</span>
              </div>
              <h2 className="text-4xl font-display font-extrabold text-white tracking-tight">
                Welcome back, <span className="text-gradient">{authUser?.fullName?.split(' ')[0] || "User"}</span>
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                Here's a summary of your workspace activities today.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0f1d]"></span>
              </button>
              
              <Link to="/profile/me" className="flex items-center gap-3 p-1.5 pr-4 glass rounded-2xl group transition-all hover:bg-white/10">
                <Avatar
                  src={authUser?.profilePicture}
                  name={authUser?.fullName}
                  size="sm"
                  className="rounded-xl border border-white/10"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Profile</span>
                  <span className="text-[10px] text-slate-500">Settings</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div id="stats-overview" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <StatsOverview stats={stats} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
            {/* Recent Activity */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Recent Activity
                  <span className="text-[10px] font-bold bg-white/5 text-slate-400 px-2 py-0.5 rounded">LIVE</span>
                </h3>
                <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">View All</button>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <RecentActivity activities={activities} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-4 space-y-6">
              <h3 className="text-xl font-bold text-white">Quick Actions</h3>
              <div id="quick-actions" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <QuickActions />
              </div>
            </div>
          </div>

          {/* Recommended Notes */}
          <div className="space-y-6 mb-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Recommended for You</h3>
              <Link to="/listings" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">Explore Marketplace</Link>
            </div>
            <div id="recommended-notes" className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <RecommendedNotes />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
y: '0.4s' }}>
          <RecommendedNotes />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
