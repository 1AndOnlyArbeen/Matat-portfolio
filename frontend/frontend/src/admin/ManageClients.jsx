import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getClients, createClient, updateClient, deleteClient } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";
import ConfirmModal from "./ConfirmModal";

function ManageClients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", heading: "", subtitle: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadClients(page);
  }, [page]);

  const loadClients = async (p = 1) => {
    const res = await getClients(p, 8);
    const data = res?.data;
    const list = data?.clients || (Array.isArray(data) ? data : []);
    setClients(list);
    if (data?.pagination) {
      setTotalPages(data.pagination.totalPages || 1);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", heading: "", subtitle: "" });
    setLogoFile(null);
    setShowModal(true);
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({
      name: client.clientName || client.name,
      heading: client.heading || "",
      subtitle: client.subtitle || "",
    });
    setLogoFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("clientName", form.name);
    data.append("heading", form.heading);
    data.append("subtitle", form.subtitle);
    if (logoFile) data.append("logo", logoFile);

    let result;
    if (editing) {
      result = await updateClient(editing._id, data);
    } else {
      result = await createClient(data);
    }

    if (result) {
      await loadClients(page);
      setShowModal(false);
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteClient(deleteId);
    setDeleteId(null);
    if (result) {
      if (clients.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadClients(page);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage Clients</h2>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
          <FiPlus size={16} /> Add Client
        </button>
      </div>

      {/* client logos grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {clients.map((client) => (
          <div key={client._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            {client.logo && (
              <img src={client.logo} alt={client.clientName || client.name} className="max-h-12 mx-auto mb-3 object-contain" />
            )}
            <p className="font-medium text-gray-800 text-sm">{client.clientName || client.name}</p>
            {client.heading && <p className="text-gray-600 text-xs mt-0.5">{client.heading}</p>}
            {client.subtitle && <p className="text-gray-400 text-xs mt-0.5 mb-2">{client.subtitle}</p>}
            {!client.heading && !client.subtitle && <div className="mb-2"></div>}
            <div className="flex justify-center gap-2">
              <Link to={`/matat-admin/clients/${client._id}`} className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg"><FiEye size={14} /></Link>
              <button onClick={() => openEdit(client)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg cursor-pointer"><FiEdit2 size={14} /></button>
              <button onClick={() => setDeleteId(client._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer"><FiTrash2 size={14} /></button>
            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No clients yet.</div>
        )}
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
            <FiChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button key={num} onClick={() => setPage(num)} className={`w-8 h-8 rounded-lg text-sm font-medium cursor-pointer transition-colors ${num === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {num}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
            <FiChevronRight size={18} />
          </button>
        </div>
      )}

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-[2px] rounded-xl w-full max-w-md shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300">
            {saving && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">Saving changes...</p>
                <p className="text-xs text-gray-400">This may take a few seconds</p>
              </div>
            )}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit Client" : "Add Client"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                <input type="text" value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} placeholder="e.g. Leading Tech Company" className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="e.g. Transforming digital experiences since 2020" className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <ImageDropzone label="Logo" onFileSelect={setLogoFile} currentImage={editing?.logo} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer"><FiSave size={14} /> {saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="This client will be permanently deleted." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

export default ManageClients;
