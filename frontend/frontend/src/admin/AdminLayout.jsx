import { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { logoutAdmin, getMessages } from "../api/admin";
import {
  FiHome, FiImage, FiGrid, FiSmartphone, FiUsers,
  FiStar, FiCamera, FiInfo, FiMail, FiLogOut, FiMenu,
  FiX, FiMonitor, FiLayout, FiType
} from "react-icons/fi";
import logo from "../assets/matat-logo-new1.svg";
import LanguageToggle from "../components/LanguageToggle";
import { getReadIds, onReadChange } from "./messageReadStore";

// sidebar nav items - each maps to an admin page
// nameKey is a translation key under "admin.sidebar.*"
const sidebarLinks = [
  { nameKey: "admin.sidebar.dashboard", path: "/matat-admin", icon: FiHome },
  { nameKey: "admin.sidebar.heroBanner", path: "/matat-admin/hero", icon: FiMonitor },
  { nameKey: "admin.sidebar.projects", path: "/matat-admin/projects", icon: FiGrid },
  { nameKey: "admin.sidebar.apps", path: "/matat-admin/apps", icon: FiSmartphone },
  { nameKey: "admin.sidebar.clients", path: "/matat-admin/clients", icon: FiImage },
  { nameKey: "admin.sidebar.team", path: "/matat-admin/team", icon: FiUsers },
  { nameKey: "admin.sidebar.testimonials", path: "/matat-admin/testimonials", icon: FiStar },
  { nameKey: "admin.sidebar.gallery", path: "/matat-admin/gallery", icon: FiCamera },
  { nameKey: "admin.sidebar.about", path: "/matat-admin/about", icon: FiInfo },
  { nameKey: "admin.sidebar.messages", path: "/matat-admin/messages", icon: FiMail },
  { nameKey: "admin.sidebar.footer", path: "/matat-admin/footer", icon: FiLayout },
  { nameKey: "admin.sidebar.sectionHeadings", path: "/matat-admin/section-headings", icon: FiType },
];

function AdminLayout() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allMessageIds, setAllMessageIds] = useState([]); // for unread count
  const [, setReadTick] = useState(0);                    // forces re-render on read-state changes
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

  // fetch every message id once (for the unread count badge on the sidebar)
  // refetches whenever the route changes so new messages picked up naturally
  const fetchMessageIds = useCallback(async () => {
    try {
      const res = await getMessages(1, 1000);
      const list = res?.data?.message || [];
      if (Array.isArray(list)) {
        setAllMessageIds(list.map((m) => m._id));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    fetchMessageIds();
  }, [loading, location.pathname, fetchMessageIds]);

  // listen for read-state changes so the badge count updates immediately
  useEffect(() => onReadChange(() => setReadTick((t) => t + 1)), []);

  // how many messages are unread in the browser's localStorage
  const unreadCount = allMessageIds.filter((id) => !getReadIds().includes(id)).length;

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

  const current = sidebarLinks.find((l) => l.path === location.pathname);
  const CurrentIcon = current?.icon;

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col relative">
      {/* transparent watermark logo in background - hidden on dashboard */}
      {location.pathname !== "/matat-admin" && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <img src={logo} alt="" className="w-96 h-96 object-contain opacity-[0.08]" />
        </div>
      )}

      {/* full-width top header with logo merged in */}
      <header className="h-16 sm:h-24 bg-white/60 backdrop-blur-xl shadow-[0_6px_24px_rgba(37,99,235,0.15)] border-b border-blue-100/50 flex items-center px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4 shrink-0 z-40">
        <button
          className="lg:hidden text-blue-600 cursor-pointer shrink-0"
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu size={24} />
        </button>

        {/* logo on left */}
        <Link to="/matat-admin" className="flex items-center shrink-0">
          <img src={logo} alt="Matat" className="h-8 sm:h-12 lg:h-14 w-auto" />
        </Link>

        {/* current page title centered */}
        <h1 className="flex-1 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-2xl lg:text-3xl font-bold text-blue-700 truncate min-w-0">
          {CurrentIcon && <CurrentIcon className="text-blue-500 shrink-0 hidden sm:block" size={28} />}
          <span className="truncate">{current ? t(current.nameKey) : t("admin.admin")}</span>
        </h1>

        {/* language toggle hidden on small screens, view-site button collapses to icon-ish on mobile */}
        <div className="hidden sm:flex items-center gap-2">
          <LanguageToggle />
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-base font-medium text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all shrink-0"
        >
          {t("admin.viewSite")}
        </a>
      </header>

      {/* mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* sidebar + main content row */}
      <div className="flex-1 flex min-h-0 p-3 sm:p-4 gap-3 sm:gap-4">
        {/* sidebar (separate rounded bar starting below header) */}
        <aside
          className={`fixed lg:static top-20 sm:top-28 bottom-4 lg:bottom-auto lg:top-auto left-3 sm:left-4 lg:left-0 z-50 w-[85vw] max-w-[260px] sm:w-64 bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgba(37,99,235,0.12)] transform transition-transform lg:transform-none overflow-hidden flex flex-col shrink-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"
          }`}
        >
          {/* close button on mobile */}
          <div className="lg:hidden flex justify-end p-3">
            <button
              className="text-gray-500 cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* sidebar nav links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const isMessages = link.nameKey === "admin.sidebar.messages";
              return (
                <Link
                  key={link.nameKey}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <link.icon size={18} />
                  <span className="flex-1">{t(link.nameKey)}</span>
                  {isMessages && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* logout button at bottom */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors cursor-pointer"
            >
              <FiLogOut size={18} />
              {t("admin.logout")}
            </button>
          </div>
        </aside>

        {/* page content - each admin page renders here (only this scrolls) */}
        <main className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgba(37,99,235,0.08)] px-4 sm:px-6 pb-4 sm:pb-6 min-w-0 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
