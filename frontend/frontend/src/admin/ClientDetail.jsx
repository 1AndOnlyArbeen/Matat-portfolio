import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getClients } from "../api/admin";
import { FiArrowLeft, FiEdit2, FiBriefcase, FiExternalLink } from "react-icons/fi";

// admin client detail view
function AdminClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients().then((res) => {
      if (res) {
        const found = res.find((c) => c._id === id);
        setClient(found || null);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">Client not found</p>
        <Link to="/matat-admin/clients" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 justify-center">
          <FiArrowLeft size={16} /> Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link to="/matat-admin/clients" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
          <FiArrowLeft size={16} /> Back
        </Link>
        <Link to="/matat-admin/clients" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
          <FiEdit2 size={14} /> Edit
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* client header */}
        <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-gray-100">
          {client.logo && (
            <img src={client.logo} alt={client.name} className="h-14 object-contain mb-3" />
          )}
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{client.name}</h1>
          {client.industry && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full font-medium">
              <FiBriefcase size={12} /> {client.industry}
            </span>
          )}
        </div>

        {/* description */}
        {client.description && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">About</h3>
            <p className="text-gray-600 leading-relaxed">{client.description}</p>
          </div>
        )}

        {/* projects */}
        {client.projects && client.projects.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Projects Together</h3>
            <div className="flex flex-wrap gap-2">
              {client.projects.map((p, i) => (
                <span key={i} className="bg-gray-50 text-gray-700 text-sm px-3 py-1.5 rounded-lg border border-gray-200">{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* website */}
        {client.website && client.website !== "#" && (
          <a href={client.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
            Visit Website <FiExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

export default AdminClientDetail;
