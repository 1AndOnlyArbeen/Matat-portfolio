import { useState, useEffect } from "react";
import { getDashboardStats } from "../api/admin";
import {
  FiGrid, FiSmartphone, FiUsers, FiImage,
  FiStar, FiCamera, FiMail, FiTrendingUp
} from "react-icons/fi";

// fallback stats when backend isnt connected
const defaultStats = {
  projects: 0,
  apps: 0,
  clients: 0,
  team: 0,
  testimonials: 0,
  gallery: 0,
  messages: 0,
};

// maps stat key to icon and color
const statCards = [
  { key: "projects", label: "Projects", icon: FiGrid, color: "bg-blue-500" },
  { key: "apps", label: "Apps", icon: FiSmartphone, color: "bg-indigo-500" },
  { key: "clients", label: "Clients", icon: FiImage, color: "bg-green-500" },
  { key: "team", label: "Team Members", icon: FiUsers, color: "bg-purple-500" },
  { key: "testimonials", label: "Testimonials", icon: FiStar, color: "bg-yellow-500" },
  { key: "gallery", label: "Gallery Images", icon: FiCamera, color: "bg-pink-500" },
  { key: "messages", label: "Messages", icon: FiMail, color: "bg-red-500" },
];

function Dashboard() {
  const [stats, setStats] = useState(defaultStats);

  // load dashboard stats on mount
  useEffect(() => {
    getDashboardStats().then((res) => {
      if (res) setStats(res);
    });
  }, []);

  return (
    <div>
      {/* welcome header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back!</h2>
        <p className="text-gray-500 text-sm">Here's an overview of your portfolio content.</p>
      </div>

      {/* stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.color} p-2.5 rounded-lg text-white`}>
                <card.icon size={20} />
              </div>
              <FiTrendingUp className="text-green-400" size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats[card.key] ?? 0}</p>
            <p className="text-gray-500 text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      {/* quick tip */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="text-blue-900 font-semibold mb-1">Quick Tip</h3>
        <p className="text-blue-700 text-sm">
          Use the sidebar to manage each section of your portfolio. All changes will reflect on the live site once saved.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
