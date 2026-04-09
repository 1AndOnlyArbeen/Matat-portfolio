import { useState, useEffect } from "react";
import { getAllHeroes, createHero, updateHero, toggleHero, deleteHero } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";
import ConfirmModal from "./ConfirmModal";

function ManageHero() {
  const [heroes, setHeroes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", subtitle: "", buttonText: "", buttonLink: "" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadHeroes(page);
  }, [page]);

  const loadHeroes = async (p = 1) => {
    const res = await getAllHeroes(p, 7);
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
    setForm({ title: "", subtitle: "", buttonText: "", buttonLink: "" });
    setImageFile(null);
    setShowModal(true);
  };

  // open modal for editing (placeholder — backend edit route needed)
  const openEdit = (hero) => {
    setEditing(hero);
    setForm({
      title: hero.title || "",
      subtitle: hero.subtitle || "",
      buttonText: hero.buttonText || "",
      buttonLink: hero.buttonLink || "",
    });
    setImageFile(null);
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
    if (imageFile) data.append("backgroundImage", imageFile);

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage Hero Banners</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
        >
          <FiPlus size={16} /> Add Banner
        </button>
      </div>

      {/* banners list */}
      <div className="space-y-3">
        {heroes.map((hero) => (
          <div
            key={hero._id}
            className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-xl ${
              hero.isActive
                ? "bg-green-50/40 border-green-400/50 shadow-[0_4px_20px_rgba(34,197,94,0.25)]"
                : "bg-white/30 border-blue-300/40 shadow-[0_4px_20px_rgba(30,64,175,0.2)]"
            }`}
          >
            {/* thumbnail */}
            {hero.backgroundImage && (
              <img
                src={hero.backgroundImage}
                alt={hero.title}
                className="w-20 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
              />
            )}

            {/* info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{hero.title}</p>
              <p className="text-xs text-gray-500 truncate">{hero.subtitle}</p>
              {hero.buttonLink && (
                <p className="text-xs text-blue-500 truncate mt-0.5">{hero.buttonText} → {hero.buttonLink}</p>
              )}
            </div>

            {/* status badge */}
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                hero.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {hero.isActive ? "Active" : "Inactive"}
            </span>

            {/* toggle */}
            <button
              type="button"
              onClick={() => handleToggle(hero._id)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                hero.isActive
                  ? "text-green-600 hover:bg-green-100"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
              title={hero.isActive ? "Deactivate" : "Activate"}
            >
              {hero.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
            </button>

            {/* edit */}
            <button
              type="button"
              onClick={() => openEdit(hero)}
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="Edit"
            >
              <FiEdit2 size={16} />
            </button>

            {/* delete */}
            <button
              type="button"
              onClick={() => setDeleteId(hero._id)}
              className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              title="Delete"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}

        {heroes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No hero banners yet. Click "Add Banner" to get started.
          </div>
        )}
      </div>

      {/* pagination */}
      {totalPages > 1 && (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  rows={3}
                  required
                  placeholder="A creative agency crafting modern web & mobile solutions"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
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

              <ImageDropzone
                label="Background Image"
                onFileSelect={setImageFile}
                currentImage={editing?.backgroundImage}
              />

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
    </div>
  );
}

export default ManageHero;
