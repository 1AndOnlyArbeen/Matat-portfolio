import { useState, useEffect } from "react";
import { getAbout, updateAbout } from "../api/admin";
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiInfo,
  FiChevronLeft, FiChevronRight, FiEye,
} from "react-icons/fi";
import ConfirmModal from "./ConfirmModal";

// the backend currently stores About as a singleton document (one per site).
// the UI here renders it as a list (1 row) for visual consistency with the
// other Manage screens; "Add" creates the first one if none exists, edit
// updates it, delete clears it back to empty.
const emptyForm = { title: "", description: "", mission: "", stats: [{ label: "", value: "" }] };

function ManageAbout() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const perPage = 14;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getAbout();
    if (res && (res.title || res._id)) {
      setItems([{ _id: res._id || "about-1", ...res }]);
    } else {
      setItems([]);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setMessage("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      mission: item.mission || "",
      stats: item.stats?.length ? item.stats : [{ label: "", value: "" }],
    });
    setMessage("");
    setShowModal(true);
  };

  const updateStat = (index, field, value) => {
    const updated = [...form.stats];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, stats: updated });
  };
  const addStat = () => setForm({ ...form, stats: [...form.stats, { label: "", value: "" }] });
  const removeStat = (index) =>
    setForm({ ...form, stats: form.stats.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const result = await updateAbout(form);
    if (result) {
      await load();
      setShowModal(false);
    } else {
      setMessage("Failed to save. Try again.");
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    // backend has no deleteAbout — clear by saving empty values
    await updateAbout({ title: "", description: "", mission: "", stats: [] });
    setDeleteId(null);
    await load();
  };

  // pagination
  const totalPages = viewAll ? 1 : Math.max(1, Math.ceil(items.length / perPage));
  const visible = viewAll ? items : items.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      {/* sticky header */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Manage About</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setViewAll((v) => !v); setPage(1); }}
            className="bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors"
          >
            {viewAll ? "Show Pages" : "View All"}
          </button>
          <button
            onClick={openCreate}
            disabled={items.length > 0}
            title={items.length > 0 ? "Only one About entry is supported — edit it instead" : "Add the About section"}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FiPlus size={16} /> Add About
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-clip rounded-xl border border-blue-300/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(30,64,175,0.15)]">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-14 z-20 bg-blue-50 text-gray-700 text-[11px] uppercase tracking-wide shadow-[0_2px_6px_rgba(30,64,175,0.08)]">
            <tr>
              <th className="px-3 py-2 font-semibold">Title</th>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 font-semibold">Mission</th>
              <th className="px-3 py-2 font-semibold">Stats</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/60">
            {visible.map((item) => (
              <tr key={item._id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-3 py-2 font-medium text-gray-800 max-w-[180px] truncate">{item.title || "-"}</td>
                <td className="px-3 py-2 text-gray-500 max-w-[260px] truncate">{item.description || "-"}</td>
                <td className="px-3 py-2 text-gray-500 max-w-[220px] truncate">{item.mission || "-"}</td>
                <td className="px-3 py-2 text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <FiInfo size={12} /> {item.stats?.length || 0}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setViewItem(item)} className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer" title="View"><FiEye size={14} /></button>
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg cursor-pointer" title="Edit"><FiEdit2 size={14} /></button>
                    <button onClick={() => setDeleteId(item._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer" title="Delete"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  No About section yet. Click "Add About" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {!viewAll && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`w-8 h-8 rounded-lg text-sm font-medium cursor-pointer transition-colors ${num === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}

      {/* CREATE / EDIT modal — centered */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-[2px] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300">
            {saving && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">Saving changes...</p>
              </div>
            )}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit About" : "Add About"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="About Us"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
                <textarea
                  value={form.mission}
                  onChange={(e) => setForm({ ...form, mission: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* stats */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Stats</label>
                  <button type="button" onClick={addStat} className="text-blue-600 text-sm flex items-center gap-1 cursor-pointer hover:text-blue-800">
                    <FiPlus size={14} /> Add Stat
                  </button>
                </div>
                <div className="space-y-2">
                  {form.stats?.map((stat, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateStat(index, "value", e.target.value)}
                        placeholder="150+"
                        className="w-24 px-3 py-2 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(index, "label", e.target.value)}
                        placeholder="Projects Completed"
                        className="flex-1 px-3 py-2 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeStat(index)}
                        className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {message && <p className="text-sm text-red-500 font-medium">{message}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer"
                >
                  <FiSave size={14} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
          <div
            className="relative bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">About — Details</h3>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Title</p>
                <p className="text-gray-800 font-medium">{viewItem.title || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Description</p>
                <p className="text-gray-700 whitespace-pre-wrap">{viewItem.description || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Mission</p>
                <p className="text-gray-700 whitespace-pre-wrap">{viewItem.mission || "-"}</p>
              </div>
              {viewItem.stats?.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Stats</p>
                  <div className="grid grid-cols-2 gap-3">
                    {viewItem.stats.map((s, i) => (
                      <div key={i} className="bg-blue-50/60 rounded-lg p-3">
                        <p className="text-blue-700 font-bold text-lg">{s.value}</p>
                        <p className="text-gray-600 text-xs">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="The About section will be cleared." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

export default ManageAbout;
