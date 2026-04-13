import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getClients } from "../api/admin";
import { FiArrowLeft, FiEdit2, FiClock } from "react-icons/fi";

// admin client detail view — matches the actual schema (clientName + heading + subtitle + logo)
function AdminClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch all clients (backend supports limit=0 → no pagination) and find by id
    getClients(1, 1000).then((res) => {
      const list = res?.data?.clients || [];
      const found = list.find((c) => c._id === id);
      setClient(found || null);
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
        {/* client header — logo + name */}
        <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-gray-100">
          {client.logo ? (
            <div className="w-28 h-28 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4 p-3">
              <img src={client.logo} alt={client.clientName} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
              No logo
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{client.clientName || "-"}</h1>
        </div>

        {/* heading */}
        {client.heading && (
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Heading</p>
            <p className="text-gray-800 font-semibold text-lg">{client.heading}</p>
          </div>
        )}

        {/* subtitle */}
        {client.subtitle && (
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Subtitle</p>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{client.subtitle}</p>
          </div>
        )}

        {/* metadata */}
        {(client.createdAt || client.updatedAt) && (
          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
            {client.createdAt && (
              <p className="inline-flex items-center gap-1.5">
                <FiClock size={11} /> Created: {new Date(client.createdAt).toLocaleString()}
              </p>
            )}
            {client.updatedAt && client.updatedAt !== client.createdAt && (
              <p className="inline-flex items-center gap-1.5 ml-4">
                <FiClock size={11} /> Last updated: {new Date(client.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClientDetail;
