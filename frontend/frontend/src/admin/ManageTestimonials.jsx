import { useState, useEffect } from "react";
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiStar, FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";
import ConfirmModal from "./ConfirmModal";

function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", company: "", text: "", rating: 5 });
  const [hoverRating, setHoverRating] = useState(0); // for star preview on hover
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  // bulk selection
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // view modal
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    loadTestimonials(page);
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
      prev.size === testimonials.length ? new Set() : new Set(testimonials.map((t) => t._id)),
    );
  const allSelected = testimonials.length > 0 && selectedIds.size === testimonials.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < testimonials.length;
  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    await Promise.all(Array.from(selectedIds).map((id) => deleteTestimonial(id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    await loadTestimonials(page);
  };

  const loadTestimonials = async (p = 1) => {
    const res = await getTestimonials(viewAll ? 1 : p, viewAll ? 1000 : 14);
    const data = res?.data;
    const list = data?.testimonial || (Array.isArray(data) ? data : []);
    setTestimonials(list);
    if (data?.pagination) {
      setTotalPages(data.pagination.totalPages || 1);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", company: "", text: "", rating: 5 });
    setAvatarFile(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      company: item.company || "",
      text: item.reviewText || item.text,
      rating: item.rating || 5,
    });
    setAvatarFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("name", form.name);
    data.append("company", form.company);
    data.append("reviewText", form.text);
    data.append("rating", form.rating);
    if (avatarFile) data.append("avatar", avatarFile);

    let result;
    if (editing) {
      result = await updateTestimonial(editing._id, data);
    } else {
      result = await createTestimonial(data);
    }

    if (result) {
      await loadTestimonials(page);
      setShowModal(false);
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteTestimonial(deleteId);
    setDeleteId(null);
    if (result) {
      if (testimonials.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadTestimonials(page);
      }
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Manage Testimonials</h2>
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
            <FiPlus size={16} /> Add Testimonial
          </button>
        </div>
      </div>

      {/* testimonials table */}
      <div className="overflow-x-clip rounded-xl border border-blue-300/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(30,64,175,0.15)]">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-14 z-20 bg-blue-50 text-gray-700 text-[11px] uppercase tracking-wide shadow-[0_2px_6px_rgba(30,64,175,0.08)]">
            <tr>
              <th className="px-3 py-2 w-8">
                <input type="checkbox" checked={allSelected} ref={(el) => el && (el.indeterminate = someSelected)} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-600 cursor-pointer" title="Select all on this page" />
              </th>
              <th className="px-3 py-2 font-semibold">Avatar</th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Company</th>
              <th className="px-3 py-2 font-semibold">Rating</th>
              <th className="px-3 py-2 font-semibold">Review</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/60">
            {testimonials.map((item) => (
              <tr key={item._id} className={`transition-colors ${selectedIds.has(item._id) ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-blue-50/40"}`}>
                <td className="px-3 py-2 w-8">
                  <input type="checkbox" checked={selectedIds.has(item._id)} onChange={() => toggleSelect(item._id)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                </td>
                <td className="px-3 py-2">
                  {item.avatar && (
                    <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                  )}
                </td>
                <td className="px-3 py-2 font-medium text-gray-800 max-w-[160px] truncate">{item.name}</td>
                <td className="px-3 py-2 text-gray-500 max-w-[160px] truncate">{item.company || "-"}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar key={i} size={12} className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-500 max-w-[240px] truncate">{item.reviewText || item.text}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setViewItem(item)} className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer" title="View"><FiEye size={14} /></button>
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg cursor-pointer" title="Edit"><FiEdit2 size={14} /></button>
                    <button onClick={() => setDeleteId(item._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer" title="Delete"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}

            {testimonials.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">No testimonials yet.</td>
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
          <div className="relative bg-white/95 backdrop-blur-[2px] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300">
            {saving && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">{avatarFile ? "Uploading image..." : "Saving changes..."}</p>
                <p className="text-xs text-gray-400">This may take a few seconds</p>
              </div>
            )}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit Testimonial" : "Add Testimonial"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
                <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={4} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div
                  className="flex items-center gap-1"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    // hover state takes precedence; click toggles off if same star clicked twice
                    const filled = (hoverRating || form.rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: form.rating === star ? 0 : star })}
                        onMouseEnter={() => setHoverRating(star)}
                        className="cursor-pointer transition-transform hover:scale-110"
                        title={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        <FiStar
                          size={28}
                          className={`transition-colors ${filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-3 text-sm font-semibold text-gray-600 select-none">
                    {form.rating > 0 ? `${form.rating} / 5` : "No rating"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Click again on the same star to clear.</p>
              </div>
              <ImageDropzone label="Avatar" onFileSelect={setAvatarFile} currentImage={editing?.avatar} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer"><FiSave size={14} /> {saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="This testimonial will be permanently deleted." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}

      {bulkDeleteOpen && (
        <ConfirmModal
          message={`${selectedIds.size} testimonial${selectedIds.size > 1 ? "s" : ""} will be permanently deleted.${bulkDeleting ? " Deleting…" : ""}`}
          onConfirm={confirmBulkDelete}
          onCancel={() => !bulkDeleting && setBulkDeleteOpen(false)}
        />
      )}

      {/* VIEW modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
          <div
            className="relative bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Testimonial — Details</h3>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                {viewItem.avatar ? (
                  <img src={viewItem.avatar} alt={viewItem.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No avatar</div>
                )}
                <div className="min-w-0">
                  <p className="text-gray-800 font-bold text-lg truncate">{viewItem.name}</p>
                  {viewItem.company && <p className="text-gray-500 text-sm truncate">{viewItem.company}</p>}
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar key={i} size={13} className={i < viewItem.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Review</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewItem.reviewText || viewItem.text || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTestimonials;
