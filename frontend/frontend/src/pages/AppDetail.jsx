import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAppById } from "../api";
import { appsData } from "../data/placeholders";
import { FiArrowLeft, FiExternalLink, FiSmartphone, FiStar, FiDownload } from "react-icons/fi";

// single app detail page
// shows app icon, screenshots, description, rating, downloads
function AppDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

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
    });
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
            <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">{app.name}</h1>

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
              {app.rating && (
                <span className="flex items-center gap-1 text-yellow-500 text-sm">
                  <FiStar size={14} className="fill-yellow-400" /> {app.rating}
                </span>
              )}
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
        {app.screenshots && app.screenshots.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Screenshots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {app.screenshots.map((src, i) => (
                <div key={i} className="rounded-xl overflow-hidden shadow-md">
                  <img src={src} alt={`${app.name} screenshot ${i + 1}`} className="w-full h-56 object-cover" />
                </div>
              ))}
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
            {app.rating && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Rating</p>
                <p className="text-gray-700 font-medium text-sm">{app.rating} / 5.0</p>
              </div>
            )}
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
