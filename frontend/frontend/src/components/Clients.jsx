import { useState, useEffect } from "react";
import { getClients } from "../api";
import { clientsData as fallback } from "../data/placeholders";
import { FiX, FiBriefcase, FiExternalLink, FiGrid } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

// client logos section - shows companies we have worked with
// clicking a logo opens a popup with client details
function Clients() {
  const [clients, setClients] = useState(fallback);
  const [selected, setSelected] = useState(null); // currently opened client popup
  const [headingRef, headingVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation(0.1);

  useEffect(() => {
    getClients().then((res) => {
      if (res && res.length > 0) setClients(res);
    });
  }, []);

  return (
    <section id="clients" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div ref={headingRef} className={`text-center mb-10 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">Our Clients</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Trusted by businesses and startups around the world.
          </p>
        </div>

        {/* logos grid - click opens popup */}
        <div ref={gridRef} className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center stagger-children ${gridVisible ? "visible" : ""}`}>
          {clients.map((client) => (
            <button
              key={client._id}
              onClick={() => setSelected(client)}
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-300 h-20 hover:scale-105 cursor-pointer"
            >
              <img
                src={client.logo}
                alt={client.name}
                className="max-h-10 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
              />
            </button>
          ))}
        </div>
      </div>

      {/* client detail popup */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in visible"
            onClick={(e) => e.stopPropagation()}
          >
            {/* cover image */}
            {selected.image && (
              <div className="relative h-40 overflow-hidden">
                <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                {/* close button on image */}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full cursor-pointer transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            )}

            {/* logo + name + industry */}
            <div className={`px-6 text-center relative ${selected.image ? "-mt-8" : "pt-6"}`}>
              {!selected.image && (
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  <FiX size={20} />
                </button>
              )}
              {selected.logo && (
                <div className={`inline-block bg-white rounded-xl p-2 shadow-md ${selected.image ? "relative z-10" : "mb-2"}`}>
                  <img src={selected.logo} alt={selected.name} className="h-10 object-contain" />
                </div>
              )}
              <h3 className="text-xl font-bold text-blue-900 mt-2">{selected.name}</h3>
              {selected.industry && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium mt-2">
                  <FiBriefcase size={10} /> {selected.industry}
                </span>
              )}
            </div>

            {/* popup body */}
            <div className="p-6">
              {/* description */}
              {selected.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{selected.description}</p>
              )}

              {/* projects we did for them */}
              {selected.projects && selected.projects.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                    <FiGrid size={14} /> Projects Together
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.projects.map((project, i) => (
                      <span key={i} className="bg-gray-50 text-gray-700 text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-medium">
                        {project}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* website link */}
              {selected.website && selected.website !== "#" && (
                <a
                  href={selected.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Visit Website <FiExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Clients;
