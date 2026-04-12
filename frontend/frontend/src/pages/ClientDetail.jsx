import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getClientById } from "../api";
import { clientsData } from "../data/placeholders";
import { FiArrowLeft, FiExternalLink, FiBriefcase, FiGrid } from "react-icons/fi";

// single client detail page
// shows client logo, description, industry, and projects we did for them
function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // try backend first
    getClientById(id).then((res) => {
      if (res) {
        setClient(res);
      } else {
        // fallback to placeholder
        const found = clientsData.find((c) => c._id === id);
        setClient(found || null);
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
  if (!client) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <p className="text-lg mb-4">Client not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          <FiArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* back button */}
        <Link
          to="/#clients"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 text-sm font-medium transition-colors"
        >
          <FiArrowLeft size={16} /> Back to Clients
        </Link>

        {/* client card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

          {/* header with logo */}
          <div className="bg-blue-50 p-8 sm:p-12 flex flex-col items-center text-center">
            {client.logo && (
              <img src={client.logo} alt={client.clientName || client.name} className="h-16 sm:h-20 object-contain mb-4" />
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">{client.clientName || client.name}</h1>
            {client.industry && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
                <FiBriefcase size={12} /> {client.industry}
              </span>
            )}
          </div>

          {/* content */}
          <div className="p-6 sm:p-8">
            {/* description */}
            {client.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">About</h2>
                <p className="text-gray-600 leading-relaxed">{client.description}</p>
              </div>
            )}

            {/* projects we did for them */}
            {client.projects && client.projects.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <FiGrid size={16} /> Projects Together
                </h2>
                <div className="flex flex-wrap gap-2">
                  {client.projects.map((project, i) => (
                    <span key={i} className="bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg border border-gray-200 font-medium">
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* website link */}
            {client.website && client.website !== "#" && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Visit Website <FiExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDetail;
