import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getApps } from "../api/admin";
import { FiArrowLeft, FiEdit2, FiSmartphone, FiStar, FiDownload } from "react-icons/fi";

// admin app detail view
function AdminAppDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApps(1, 0).then((res) => {
      const list = res?.data?.apps || [];
      const found = list.find((a) => a._id === id);
      setApp(found || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">App not found</p>
        <Link to="/matat-admin/apps" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 justify-center">
          <FiArrowLeft size={16} /> Back to Apps
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link to="/matat-admin/apps" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
          <FiArrowLeft size={16} /> Back
        </Link>
        <Link to="/matat-admin/apps" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
          <FiEdit2 size={14} /> Edit
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* app header */}
        <div className="flex items-start gap-4 mb-6">
          {(app.appIcon || app.icon) && (
            <img src={app.appIcon || app.icon} alt={app.appName || app.name} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{app.appName || app.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiSmartphone size={14} /> {app.platform}</span>
              {app.downloads && <span className="flex items-center gap-1"><FiDownload size={14} /> {app.downloads}</span>}
              {app.rating && <span className="flex items-center gap-1"><FiStar size={14} className="text-yellow-400" /> {app.rating}</span>}
            </div>
          </div>
        </div>

        {/* description */}
        <p className="text-gray-600 leading-relaxed mb-6">{app.longDescription || app.description}</p>

        {/* screenshots */}
        {app.screenshots && app.screenshots.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Screenshots</h3>
            <div className="grid grid-cols-2 gap-4">
              {app.screenshots.map((src, i) => (
                <div key={i} className="rounded-lg overflow-hidden shadow-sm">
                  <img src={src} alt={`Screenshot ${i + 1}`} className="w-full h-40 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAppDetail;
