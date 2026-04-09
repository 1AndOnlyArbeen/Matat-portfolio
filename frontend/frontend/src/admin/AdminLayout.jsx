import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../api/admin";
import {
  FiHome, FiImage, FiGrid, FiSmartphone, FiUsers,
  FiStar, FiCamera, FiInfo, FiMail, FiLogOut, FiMenu,
  FiX, FiMonitor
} from "react-icons/fi";
import logo from "../assets/matat-logo-new1.svg";

// sidebar nav items - each maps to an admin page
const sidebarLinks = [
  { name: "Dashboard", path: "/matat-admin", icon: FiHome },
  { name: "Hero Banner", path: "/matat-admin/hero", icon: FiMonitor },
  { name: "Projects", path: "/matat-admin/projects", icon: FiGrid },
  { name: "Apps", path: "/matat-admin/apps", icon: FiSmartphone },
  { name: "Clients", path: "/matat-admin/clients", icon: FiImage },
  { name: "Team", path: "/matat-admin/team", icon: FiUsers },
  { name: "Testimonials", path: "/matat-admin/testimonials", icon: FiStar },
  { name: "Gallery", path: "/matat-admin/gallery", icon: FiCamera },
  { name: "About", path: "/matat-admin/about", icon: FiInfo },
  { name: "Messages", path: "/matat-admin/messages", icon: FiMail },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("matat-admin-token");
    if (!token) {
      navigate("/matat-admin/login");
      return;
    }

    setLoading(false);
  }, [navigate]);

  // logout handler - call backend then redirect
  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/matat-admin/login");
  };

  // show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* transparent watermark logo in background - hidden on dashboard */}
      {location.pathname !== "/matat-admin" && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <img src={logo} alt="" className="w-96 h-96 object-contain opacity-[0.08]" />
        </div>
      )}

      {/* mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <Link to="/matat-admin" className="flex items-center">
            <img src={logo} alt="Matat" className="h-8 w-auto" />
          </Link>
          <button
            className="lg:hidden text-gray-500 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* sidebar nav links */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <link.icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* logout button at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors cursor-pointer"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* main content area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar with hamburger for mobile */}
        <header className="h-16 bg-white/40 backdrop-blur-xl shadow-[0_6px_24px_rgba(37,99,235,0.15)] border-b border-blue-100/50 flex items-center px-6 gap-4 shrink-0 sticky top-0 z-30">
          <button
            className="lg:hidden text-blue-600 cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu size={22} />
          </button>

          {(() => {
            const current = sidebarLinks.find((l) => l.path === location.pathname);
            const Icon = current?.icon;
            return (
              <h1 className="flex-1 flex items-center justify-center gap-2 text-xl font-bold text-blue-700">
                {Icon && <Icon size={22} className="text-blue-500" />}
                {current?.name || "Admin"}
              </h1>
            );
          })()}

          {/* link to view live site */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
          >
            View Site
          </a>
        </header>

        {/* page content - each admin page renders here */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
