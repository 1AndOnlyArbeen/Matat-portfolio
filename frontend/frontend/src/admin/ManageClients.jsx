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
  const [viewAll, setViewAll] = useState(false);

  // bulk selection
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    loadClients(page);
    setSelectedIds(new Set());
  }, [page, viewAll]);

  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      prev.size === clients.length ? new Set() : new Set(clients.map((c) => c._id)),
    );
  const allSelected = clients.length > 0 && selectedIds.size === clients.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < clients.length;
  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    await Promise.all(Array.from(selectedIds).map((id) => deleteClient(id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    await loadClients(page);
  };

  const loadClients = async (p = 1) => {
    const res = await getClients(viewAll ? 1 : p, viewAll ? 1000 : 14);
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
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Manage Clients</h2>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-3 py-2 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
              >
                <FiX size={13} /> Unselect All ({selectedIds.size})
              </button>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
              >
                <FiTrash2 size={13} /> Delete Selected ({selectedIds.size})
              </button>
            </>
          )}
          <button
            onClick={() => { setViewAll((v) => !v); setPage(1); }}
            className="bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors"
          >
            {viewAll ? "Show Pages" : "View All"}
          </button>
          <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
            <FiPlus size={16} /> Add Client
          </button>
        </div>
      </div>

      {/* clients table */}
      <div className="overflow-x-clip rounded-xl border border-blue-300/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(30,64,175,0.15)]">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-14 z-20 bg-blue-50 text-gray-700 text-[11px] uppercase tracking-wide shadow-[0_2px_6px_rgba(30,64,175,0.08)]">
            <tr>
              <th className="px-3 py-2 w-8">
                <input type="checkbox" checked={allSelected} ref={(el) => el && (el.indeterminate = someSelected)} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-600 cursor-pointer" title="Select all on this page" />
              </th>
              <th className="px-3 py-2 font-semibold">Logo</th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Heading</th>
              <th className="px-3 py-2 font-semibold">Subtitle</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/60">
            {clients.map((client) => (
              <tr key={client._id} className={`transition-colors ${selectedIds.has(client._id) ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-blue-50/40"}`}>
                <td className="px-3 py-2 w-8">
                  <input type="checkbox" checked={selectedIds.has(client._id)} onChange={() => toggleSelect(client._id)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                </td>
                <td className="px-3 py-2">
                  {client.logo && (
                    <img src={client.logo} alt={client.clientName || client.name} className="w-9 h-9 object-contain rounded-lg border border-gray-200 bg-white p-0.5" />
                  )}
                </td>
                <td className="px-3 py-2 font-medium text-gray-800 max-w-[160px] truncate">{client.clientName || client.name}</td>
                <td className="px-3 py-2 text-gray-600 max-w-[160px] truncate">{client.heading || "-"}</td>
                <td className="px-3 py-2 text-gray-400 max-w-[240px] truncate">{client.subtitle || "-"}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/matat-admin/clients/${client._id}`} className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg" title="View"><FiEye size={14} /></Link>
                    <button onClick={() => openEdit(client)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg cursor-pointer" title="Edit"><FiEdit2 size={14} /></button>
                    <button onClick={() => setDeleteId(client._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer" title="Delete"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}

            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">No clients yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {!viewAll && totalPages > 1 && (
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

      {bulkDeleteOpen && (
        <ConfirmModal
          message={`${selectedIds.size} client${selectedIds.size > 1 ? "s" : ""} will be permanently deleted.${bulkDeleting ? " Deleting…" : ""}`}
          onConfirm={confirmBulkDelete}
          onCancel={() => !bulkDeleting && setBulkDeleteOpen(false)}
        />
      )}
    </div>
  );
}

export default ManageClients;
