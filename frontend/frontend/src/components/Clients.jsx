import { useState, useEffect } from "react";
import { getClients } from "../api";
import { FiX } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

function Clients() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [sliderRef, sliderVisible] = useScrollAnimation(0.1);

  useEffect(() => {
    getClients().then((res) => {
      const list = res?.clients || (Array.isArray(res) ? res : []);
      if (list.length > 0) setClients(list);
    });
  }, []);

  // hide section if no clients returned
  if (clients.length === 0) return null;

  const clientCard = (client) => (
    <button
      onClick={() => setSelected(client)}
      className="w-48 shrink-0 text-left bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1 cursor-pointer"
    >
      <div className="h-28 overflow-hidden bg-gray-50">
        <img
          src={client.logo}
          alt={client.clientName || client.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-3">
        <h3 className="text-xs font-semibold text-blue-900 mb-0.5 truncate">{client.clientName || client.name}</h3>
        {(client.heading || client.industry) && (
          <p className="text-blue-500 text-[11px] truncate">{client.heading || client.industry}</p>
        )}
        {(client.subtitle || client.description) && (
          <p className="text-gray-500 text-[11px] line-clamp-1">{client.subtitle || client.description}</p>
        )}
      </div>
    </button>
  );


  return (
    <section id="clients" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div ref={headingRef} className={`text-center mb-12 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">Our Clients</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Trusted by businesses and startups around the world.
          </p>
        </div>

        {/* client cards — animate as a marquee only when there are enough cards
            to fill a row; with fewer, show a centered static grid (no scroll). */}
        <div ref={sliderRef} className={`animate-fade-up ${sliderVisible ? "visible" : ""}`}>
          {clients.length >= 7 ? (
            // marquee — duplicate the list so the scroll loops seamlessly
            <div className="overflow-hidden">
              <div className="flex gap-4 animate-marquee-clients">
                {clients.map((client) => (
                  <div key={client._id}>{clientCard(client)}</div>
                ))}
                {clients.map((client) => (
                  <div key={`dup-${client._id}`}>{clientCard(client)}</div>
                ))}
              </div>
            </div>
          ) : (
            // static — center the cards, no animation, no duplication
            <div className="flex flex-wrap justify-center gap-4">
              {clients.map((client) => (
                <div key={client._id}>{clientCard(client)}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* client detail popup */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in visible"
            onClick={(e) => e.stopPropagation()}
          >
            {/* cover image */}
            <div className="relative h-52 overflow-hidden bg-gray-50">
              <img
                src={selected.logo}
                alt={selected.clientName || selected.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full cursor-pointer transition-colors"
              >
                <FiX size={16} />
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <h3 className="text-2xl font-bold text-white">{selected.clientName || selected.name}</h3>
                {(selected.heading || selected.industry) && (
                  <p className="text-blue-200 text-sm mt-1">{selected.heading || selected.industry}</p>
                )}
              </div>
            </div>

            {/* popup body */}
            <div className="p-6">
              {(selected.subtitle || selected.description) && (
                <p className="text-gray-600 leading-relaxed mb-4">{selected.subtitle || selected.description}</p>
              )}

              {selected.projects && selected.projects.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Projects Together</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.projects.map((project, i) => (
                      <span key={i} className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full font-medium">
                        {project}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.website && selected.website !== "#" && (
                <a
                  href={selected.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Visit Website
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
