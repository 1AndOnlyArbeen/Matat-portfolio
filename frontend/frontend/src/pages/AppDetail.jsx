import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAppById } from "../api";
import { appsData } from "../data/placeholders";
import { FiArrowLeft, FiExternalLink, FiSmartphone, FiStar, FiDownload, FiX, FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";

// single app detail page
// shows app icon, screenshots, description, rating, downloads
function AppDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    // try backend first
    getAppById(id).then((res) => {
      if (res) {
        setApp(res);
      } else {
        // fallback to placeholder
        const found = appsData.find((a) => a._id === id);
        setApp(found || null);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // not found
  if (!app) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <p className="text-lg mb-4">App not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          <FiArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  // use backend screenshots/rating if present, otherwise show dummy placeholders
  const screenshots = (app.screenshots && app.screenshots.length > 0
    ? app.screenshots
    : [
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&q=80",
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80",
      ]
  ).map((s) => (typeof s === "string" ? s : s?.url)).filter(Boolean);
  const rating = app.rating || 4.5;

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevShot = () =>
    setLightboxIndex((i) => (i - 1 + screenshots.length) % screenshots.length);
  const nextShot = () =>
    setLightboxIndex((i) => (i + 1) % screenshots.length);

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* back button */}
        <Link
          to="/#apps"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 text-sm font-medium transition-colors"
        >
          <FiArrowLeft size={16} /> Back to Apps
        </Link>

        {/* app header - icon + basic info */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          {/* app icon */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-lg shrink-0">
            <img src={app.appIcon || app.icon} alt={app.appName || app.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">{app.appName || app.name}</h1>

            {/* platform + stats */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="flex items-center gap-1 text-blue-500 text-sm">
                <FiSmartphone size={14} /> {app.platform}
              </span>
              {app.downloads && (
                <span className="flex items-center gap-1 text-gray-500 text-sm">
                  <FiDownload size={14} /> {app.downloads} Downloads
                </span>
              )}
              <span className="flex items-center gap-1 text-yellow-500 text-sm">
                <FiStar size={14} className="fill-yellow-400" /> {rating}
              </span>
            </div>

            <p className="text-gray-500">{app.description}</p>
          </div>
        </div>

        {/* full description */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">About this App</h2>
          <p className="text-gray-600 leading-relaxed">
            {app.longDescription || app.description}
          </p>
        </div>

        {/* screenshots */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-900 inline-flex items-center gap-2">
              <FiImage className="text-blue-500" /> Screenshots
            </h2>
            <span className="text-xs text-gray-400">{screenshots.length} image{screenshots.length > 1 ? "s" : ""}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenshots.map((src, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i)}
                className="group relative aspect-video rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-gray-100"
              >
                <img
                  src={src}
                  alt={`${app.appName || app.name} screenshot ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/30 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* lightbox — click a screenshot to zoom */}
        {lightboxIndex !== null && (
          <div className="fixed inset-0 bg-black/90 z-50 flex flex-col backdrop-blur-sm" onClick={closeLightbox}>
            <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm text-white/80">{lightboxIndex + 1} / {screenshots.length}</p>
              <button onClick={closeLightbox} className="text-white/80 hover:text-white hover:rotate-90 transition-transform p-2">
                <FiX size={28} />
              </button>
            </div>
            <div className="flex-1 relative flex items-center justify-center px-4 sm:px-12" onClick={(e) => e.stopPropagation()}>
              <img
                src={screenshots[lightboxIndex]}
                alt={`Screenshot ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              {screenshots.length > 1 && (
                <>
                  <button onClick={prevShot} className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md hover:scale-110 transition-all cursor-pointer">
                    <FiChevronLeft size={26} />
                  </button>
                  <button onClick={nextShot} className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md hover:scale-110 transition-all cursor-pointer">
                    <FiChevronRight size={26} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* info card */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-4 uppercase tracking-wide">App Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">Platform</p>
              <p className="text-gray-700 font-medium text-sm">{app.platform}</p>
            </div>
            {app.downloads && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Downloads</p>
                <p className="text-gray-700 font-medium text-sm">{app.downloads}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400 text-xs mb-1">Rating</p>
              <p className="text-gray-700 font-medium text-sm">{rating} / 5.0</p>
            </div>
            {app.link && app.link !== "#" && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Link</p>
                <a href={app.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                  Visit <FiExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppDetail;
