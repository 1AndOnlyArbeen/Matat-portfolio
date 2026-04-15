import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  getAllHeroes,
  getProjects,
  getApps,
  getClients,
  getTeamMembers,
  getTestimonials,
  getGalleryImages,
  getMessages,
  getAllAbout,
} from "../api/admin";
import {
  FiGrid, FiSmartphone, FiUsers, FiImage,
  FiStar, FiCamera, FiMail, FiMonitor, FiInfo,
} from "react-icons/fi";

// each card maps to a list endpoint; we read pagination.totalItems from the
// response (or fall back to the array length if no pagination block was sent)
const statCards = [
  { key: "hero",         labelKey: "admin.dashboard.heroBanners",   icon: FiMonitor,    color: "bg-cyan-500",   fetch: () => getAllHeroes(1, 1),     listKey: "heroes" },
  { key: "projects",     labelKey: "admin.dashboard.projects",      icon: FiGrid,       color: "bg-blue-500",   fetch: () => getProjects(1, 1),      listKey: "project" },
  { key: "apps",         labelKey: "admin.dashboard.apps",          icon: FiSmartphone, color: "bg-indigo-500", fetch: () => getApps(1, 1),          listKey: "apps" },
  { key: "clients",      labelKey: "admin.dashboard.clients",       icon: FiImage,      color: "bg-green-500",  fetch: () => getClients(1, 1),       listKey: "clients" },
  { key: "team",         labelKey: "admin.dashboard.teamMembers",   icon: FiUsers,      color: "bg-purple-500", fetch: () => getTeamMembers(1, 1),   listKey: "teams" },
  { key: "testimonials", labelKey: "admin.dashboard.testimonials",  icon: FiStar,       color: "bg-yellow-500", fetch: () => getTestimonials(1, 1),  listKey: "testimonial" },
  { key: "gallery",      labelKey: "admin.dashboard.galleryAlbums", icon: FiCamera,     color: "bg-pink-500",   fetch: () => getGalleryImages(1, 1), listKey: "albums" },
  { key: "about",        labelKey: "admin.dashboard.aboutEntries",  icon: FiInfo,       color: "bg-orange-500", fetch: () => getAllAbout(1, 1),      listKey: "abouts" },
  { key: "messages",     labelKey: "admin.dashboard.messages",      icon: FiMail,       color: "bg-red-500",    fetch: () => getMessages(1, 1),      listKey: "message" },
];

function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // fetch every list in parallel and pull the count from pagination.totalItems
  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      const results = await Promise.all(
        statCards.map(async (card) => {
          try {
            const res = await card.fetch();
            const data = res?.data;
            // prefer pagination.totalItems (cheap — only ships 1 row)
            // fall back to list length for endpoints that don't paginate
            const total =
              data?.pagination?.totalItems ??
              data?.[card.listKey]?.length ??
              (Array.isArray(data) ? data.length : 0);
            return [card.key, total];
          } catch {
            return [card.key, 0];
          }
        }),
      );
      if (!isMounted) return;
      setStats(Object.fromEntries(results));
      setLoading(false);
    };
    loadStats();
    return () => { isMounted = false; };
  }, []);

  return (
    <div>
      {/* welcome header */}
      <div className="mb-8 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{t("admin.dashboard.welcome")}</h2>
          <p className="text-gray-500 text-sm">{t("admin.dashboard.overview")}</p>
        </div>
        {loading && (
          <span className="text-xs text-gray-400 inline-flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            {t("admin.dashboard.loadingCounts")}
          </span>
        )}
      </div>

      {/* stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.color} p-2.5 rounded-lg text-white`}>
                <card.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="inline-block w-10 h-6 bg-gray-100 rounded animate-pulse" />
              ) : (
                stats[card.key] ?? 0
              )}
            </p>
            <p className="text-gray-500 text-sm">{t(card.labelKey)}</p>
          </div>
        ))}
      </div>

      {/* quick tip */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="text-blue-900 font-semibold mb-1">{t("admin.dashboard.quickTip")}</h3>
        <p className="text-blue-700 text-sm">
          {t("admin.dashboard.quickTipText")}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
