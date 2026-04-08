import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getApps } from "../api";
import { appsData as fallback } from "../data/placeholders";
import { FiSmartphone, FiArrowRight } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

// displays mobile/web apps we've built
// each card shows app icon, name, platform, and description
function Apps() {
  const [apps, setApps] = useState(fallback);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation(0.1);

  // try loading from backend
  useEffect(() => {
    getApps().then((res) => {
      if (res && res.length > 0) setApps(res);
    });
  }, []);

  return (
    <section id="apps" className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div ref={headingRef} className={`text-center mb-12 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">Our Apps</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Mobile and web applications we have built and launched.
          </p>
        </div>

        {/* app cards */}
        <div ref={gridRef} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children ${gridVisible ? "visible" : ""}`}>
          {apps.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 text-center group hover:-translate-y-1"
            >
              {/* app icon */}
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
              </div>

              <h3 className="text-lg font-semibold text-blue-900 mb-1">{app.name}</h3>

              {/* platform badge */}
              <div className="flex items-center justify-center gap-1 text-blue-500 text-xs mb-3">
                <FiSmartphone size={12} />
                <span>{app.platform}</span>
              </div>

              <p className="text-gray-500 text-sm mb-4 line-clamp-3">{app.description}</p>

              {/* link to detail page with arrow that slides on hover */}
              <Link
                to={`/apps/${app._id}`}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors group/link"
              >
                Learn More <FiArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Apps;
