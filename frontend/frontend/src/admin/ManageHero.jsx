import { useState, useEffect } from "react";
import { getAllHeroes, createHero, updateHero, toggleHero, deleteHero } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight, FiEye, FiExternalLink } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";
import ConfirmModal from "./ConfirmModal";

function ManageHero() {
  const [heroes, setHeroes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", subtitle: "", buttonText: "", buttonLink: "", titleHe: "", subtitleHe: "", buttonTextHe: "" });
  const [imageFile, setImageFile] = useState(null);
  const [badge1File, setBadge1File] = useState(null);
  const [badge2File, setBadge2File] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [viewAll, setViewAll] = useState(false);

  // bulk selection
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // view modal
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    loadHeroes(page);
    setSelectedIds(new Set());
  }, [page, viewAll]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === heroes.length ? new Set() : new Set(heroes.map((h) => h._id)),
    );
  };
  const allSelected = heroes.length > 0 && selectedIds.size === heroes.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < heroes.length;
  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    await Promise.all(Array.from(selectedIds).map((id) => deleteHero(id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    await loadHeroes(page);
  };

  const loadHeroes = async (p = 1) => {
    const res = await getAllHeroes(viewAll ? 1 : p, viewAll ? 1000 : 14);
    const data = res?.data;
    const list = data?.heroes || (Array.isArray(data) ? data : []);
    setHeroes(list);
    if (data?.pagination) {
      setTotalPages(data.pagination.totalPages || 1);
    }
  };

  // open modal for creating new banner
  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", subtitle: "", buttonText: "", buttonLink: "", titleHe: "", subtitleHe: "", buttonTextHe: "" });
    setImageFile(null);
    setBadge1File(null);
    setBadge2File(null);
    setShowModal(true);
  };

  // open modal for editing
  const openEdit = (hero) => {
    setEditing(hero);
    setForm({
      title: hero.title || "",
      subtitle: hero.subtitle || "",
      buttonText: hero.buttonText || "",
      buttonLink: hero.buttonLink || "",
      titleHe: hero.titleHe || "",
      subtitleHe: hero.subtitleHe || "",
      buttonTextHe: hero.buttonTextHe || "",
    });
    setImageFile(null);
    setBadge1File(null);
    setBadge2File(null);
    setShowModal(true);
  };

  // create or edit hero banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // require image when creating new banner
    if (!editing && !imageFile) {
      setMessage("Background image is required");
      return;
    }

    setSaving(true);

    const data = new FormData();
    data.append("title", form.title);
    data.append("subtitle", form.subtitle);
    data.append("buttonText", form.buttonText);
    data.append("buttonLink", form.buttonLink);
    data.append("titleHe", form.titleHe);
    data.append("subtitleHe", form.subtitleHe);
    data.append("buttonTextHe", form.buttonTextHe);
    if (imageFile) data.append("backgroundImage", imageFile);
    if (badge1File) data.append("badgeImage1", badge1File);
    if (badge2File) data.append("badgeImage2", badge2File);

    let result;
    if (editing) {
      result = await updateHero(editing._id, data);
    } else {
      result = await createHero(data);
    }

    if (result) {
      await loadHeroes(page);
      setShowModal(false);
      setMessage("");
    } else {
      setMessage("Failed to save. Check all fields and try again.");
    }
    setSaving(false);
  };

  // toggle active/inactive
  const handleToggle = async (id) => {
    const result = await toggleHero(id);
    if (result) await loadHeroes(page);
  };

  // delete with confirmation
  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteHero(deleteId);
    setDeleteId(null);
    if (result) {
      if (heroes.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadHeroes(page);
      }
    }
  };

  return (
    <div>
      {/* header with add button */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-800">Manage Hero Banners</h2>
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
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FiPlus size={16} /> Add Banner
          </button>
        </div>
      </div>

      {/* banners table */}
      <div className="overflow-x-auto rounded-xl border border-blue-300/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(30,64,175,0.15)]">
        <table className="admin-list-table w-full sm:min-w-[760px] text-xs text-left">
          <thead className="bg-blue-50 text-gray-700 text-[11px] uppercase tracking-wide shadow-[0_2px_6px_rgba(30,64,175,0.08)]">
            <tr>
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => el && (el.indeterminate = someSelected)}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                  title="Select all on this page"
                />
              </th>
              <th className="px-3 py-2 font-semibold">Image</th>
              <th className="px-3 py-2 font-semibold">Title</th>
              <th className="px-3 py-2 font-semibold">Subtitle</th>
              <th className="px-3 py-2 font-semibold">Button</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/60">
            {heroes.map((hero) => (
              <tr key={hero._id} className={`transition-colors ${selectedIds.has(hero._id) ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-blue-50/40"}`}>
                <td className="px-3 py-2 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(hero._id)}
                    onChange={() => toggleSelect(hero._id)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </td>
                <td className="px-3 py-2">
                  {hero.backgroundImage && (
                    <img
                      src={hero.backgroundImage}
                      alt={hero.title}
                      className="w-9 h-9 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                </td>
                <td className="px-3 py-2 font-medium text-gray-800"><div className="max-w-[160px] truncate">{hero.title}</div></td>
                <td className="px-3 py-2 text-gray-500"><div className="max-w-[240px] truncate">{hero.subtitle}</div></td>
                <td className="px-3 py-2 text-blue-500">
                  <div className="max-w-[160px] truncate">
                    {hero.buttonLink ? `${hero.buttonText} → ${hero.buttonLink}` : "-"}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      hero.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {hero.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggle(hero._id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        hero.isActive
                          ? "text-green-600 hover:bg-green-100"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title={hero.isActive ? "Deactivate" : "Activate"}
                    >
                      {hero.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewItem(hero)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                      title="View"
                    >
                      <FiEye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(hero)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(hero._id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {heroes.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No hero banners yet. Click "Add Banner" to get started.
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
              className={`w-8 h-8 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                num === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
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

      {/* create/edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-[2px] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300">
            {/* modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editing ? "Edit Banner" : "Add New Banner"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <FiX size={20} />
              </button>
            </div>

            {/* saving overlay */}
            {saving && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">
                  {imageFile ? "Uploading image..." : "Saving changes..."}
                </p>
                <p className="text-xs text-gray-400">This may take a few seconds</p>
              </div>
            )}

            {/* modal form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (EN)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="We Build Digital Experiences"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title (HE)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={form.titleHe}
                  onChange={(e) => setForm({ ...form, titleHe: e.target.value })}
                  placeholder="כותרת בעברית..."
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (EN)</label>
                <textarea
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  rows={3}
                  required
                  placeholder="A creative agency crafting modern web & mobile solutions"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Subtitle (HE)</label>
                <textarea
                  dir="rtl"
                  value={form.subtitleHe}
                  onChange={(e) => setForm({ ...form, subtitleHe: e.target.value })}
                  rows={3}
                  placeholder="כתובית בעברית..."
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text (EN)</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    required
                    placeholder="View Our Work"
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={form.buttonLink}
                    onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                    required
                    placeholder="#projects"
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Button Text (HE)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={form.buttonTextHe}
                  onChange={(e) => setForm({ ...form, buttonTextHe: e.target.value })}
                  placeholder="טקסט כפתור בעברית..."
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <ImageDropzone
                label="Background Image"
                onFileSelect={setImageFile}
                currentImage={editing?.backgroundImage}
              />

              <div className="grid grid-cols-2 gap-4">
                <ImageDropzone
                  label="Badge Image 1"
                  onFileSelect={setBadge1File}
                  currentImage={editing?.badgeImage1}
                />
                <ImageDropzone
                  label="Badge Image 2"
                  onFileSelect={setBadge2File}
                  currentImage={editing?.badgeImage2}
                />
              </div>

              {/* error message */}
              {message && (
                <p className="text-sm text-red-500 font-medium">{message}</p>
              )}

              {/* submit */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FiSave size={14} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* delete confirmation */}
      {deleteId && (
        <ConfirmModal
          message="This banner will be permanently deleted."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {bulkDeleteOpen && (
        <ConfirmModal
          message={`${selectedIds.size} banner${selectedIds.size > 1 ? "s" : ""} will be permanently deleted.${bulkDeleting ? " Deleting…" : ""}`}
          onConfirm={confirmBulkDelete}
          onCancel={() => !bulkDeleting && setBulkDeleteOpen(false)}
        />
      )}

      {/* VIEW modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
          <div
            className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Hero Banner — Details</h3>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {viewItem.backgroundImage && (
                <img src={viewItem.backgroundImage} alt={viewItem.title} className="w-full rounded-lg border border-gray-200" />
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Title</p>
                <p className="text-gray-800 font-semibold text-lg">{viewItem.title || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Subtitle</p>
                <p className="text-gray-700 whitespace-pre-wrap">{viewItem.subtitle || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Button Text</p>
                  <p className="text-gray-700">{viewItem.buttonText || "-"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Button Link</p>
                  {viewItem.buttonLink ? (
                    <a href={viewItem.buttonLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 break-all">
                      {viewItem.buttonLink} <FiExternalLink size={12} />
                    </a>
                  ) : "-"}
                </div>
              </div>
              {(viewItem.badgeImage1 || viewItem.badgeImage2) && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Badge Images</p>
                  <div className="flex gap-3">
                    {viewItem.badgeImage1 && <img src={viewItem.badgeImage1} alt="Badge 1" className="h-14 object-contain bg-gray-50 rounded border border-gray-200 p-2" />}
                    {viewItem.badgeImage2 && <img src={viewItem.badgeImage2} alt="Badge 2" className="h-14 object-contain bg-gray-50 rounded border border-gray-200 p-2" />}
                  </div>
                </div>
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Status</p>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${viewItem.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {viewItem.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageHero;
