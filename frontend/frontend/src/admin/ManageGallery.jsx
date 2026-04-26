import { useState, useEffect, useRef } from "react";
import {
  getGalleryImages,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  replaceGalleryImagesById,
} from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiUploadCloud, FiMapPin, FiCalendar, FiImage, FiTag, FiEye } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";
import ConfirmModal from "./ConfirmModal";

function ManageGallery() {
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ caption: "", captionHe: "", place: "", placeHe: "", date: "" });
  const [thumbnailFile, setThumbnailFile] = useState(null);   // single thumbnail (cover)
  const [multiFiles, setMultiFiles] = useState([]);           // album photos
  const [previews, setPreviews] = useState([]);               // object URLs for previews
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);

  // bulk selection
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // view modal
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    loadImages();
  }, []);

  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      prev.size === images.length ? new Set() : new Set(images.map((i) => i._id)),
    );
  const allSelected = images.length > 0 && selectedIds.size === images.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < images.length;
  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    await Promise.all(Array.from(selectedIds).map((id) => deleteGalleryImage(id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    await loadImages();
  };

  // backend returns { data: { albums: [...], pagination: {...} } }
  const loadImages = async () => {
    const res = await getGalleryImages(1, 1000);
    const data = res?.data;
    const list = data?.albums || (Array.isArray(data) ? data : []);
    setImages(list);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ caption: "", captionHe: "", place: "", placeHe: "", date: "" });
    setThumbnailFile(null);
    setMultiFiles([]);
    setPreviews([]);
    setShowModal(true);
  };

  const openEdit = (img) => {
    setEditing(img);
    setForm({
      caption: img.caption || "",
      captionHe: img.captionHe || "",
      place: img.place || "",
      placeHe: img.placeHe || "",
      date: img.date ? new Date(img.date).toISOString().slice(0, 10) : "",
    });
    setThumbnailFile(null);
    setMultiFiles([]);
    setPreviews([]);
    setShowModal(true);
  };

  // pick multiple files — APPENDS to the existing selection so admin can add
  // another batch by clicking the picker again. dedup by name+size.
  const handleMultiSelect = (e) => {
    const incoming = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
    if (incoming.length === 0) return;
    setMultiFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const fresh = incoming.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
      const merged = [...prev, ...fresh];
      setPreviews(merged.map((f) => URL.createObjectURL(f)));
      return merged;
    });
    e.target.value = "";
  };

  const removeOne = (index) => {
    setMultiFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (editing) {
      // edit mode — only main fields + optional thumbnail swap (no album images here)
      const data = new FormData();
      data.append("caption", form.caption);
      data.append("captionHe", form.captionHe);
      data.append("place", form.place);
      data.append("placeHe", form.placeHe);
      data.append("date", form.date);
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);

      const result = await updateGalleryImage(editing._id, data);
      if (!result) { setSaving(false); return; }

      // if admin picked new album images, replace the existing array via dedicated endpoint
      if (multiFiles.length > 0) {
        const ssData = new FormData();
        for (const f of multiFiles) ssData.append("images", f);
        await replaceGalleryImagesById(editing._id, ssData);
      }

      await loadImages();
      setShowModal(false);
      setSaving(false);
      return;
    }

    // create mode — single request: caption + place + date + thumbnail + images[]
    if (!thumbnailFile && multiFiles.length === 0) {
      setSaving(false);
      return;
    }
    const data = new FormData();
    data.append("caption", form.caption);
    data.append("captionHe", form.captionHe);
    data.append("place", form.place);
    data.append("placeHe", form.placeHe);
    data.append("date", form.date);
    if (thumbnailFile) data.append("thumbnail", thumbnailFile);
    for (const file of multiFiles) data.append("images", file);

    const result = await uploadGalleryImage(data);
    if (result) {
      await loadImages();
      setShowModal(false);
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteGalleryImage(deleteId);
    setDeleteId(null);
    if (result) await loadImages();
  };

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-800">Manage Gallery</h2>
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
          <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
            <FiPlus size={16} /> Add Album
          </button>
        </div>
      </div>

      {/* gallery table */}
      <div className="overflow-x-auto rounded-xl border border-blue-300/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(30,64,175,0.15)]">
        <table className="admin-list-table w-full sm:min-w-[760px] text-xs text-left">
          <thead className="bg-blue-50 text-gray-700 text-[11px] uppercase tracking-wide shadow-[0_2px_6px_rgba(30,64,175,0.08)]">
            <tr>
              <th className="px-3 py-2 w-8">
                <input type="checkbox" checked={allSelected} ref={(el) => el && (el.indeterminate = someSelected)} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-600 cursor-pointer" title="Select all on this page" />
              </th>
              <th className="px-3 py-2 font-semibold">Thumbnail</th>
              <th className="px-3 py-2 font-semibold">Event Tag</th>
              <th className="px-3 py-2 font-semibold">Place</th>
              <th className="px-3 py-2 font-semibold">Date</th>
              <th className="px-3 py-2 font-semibold">Photos</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/60">
            {images.map((img) => {
              // images may be [{url, publicId}] objects or plain strings — normalize
              const firstImage = img.images?.[0];
              const firstImageUrl = typeof firstImage === "string" ? firstImage : firstImage?.url;
              const cover = img.thumbnail || img.image || firstImageUrl;
              const photoCount = img.images?.length || (img.image ? 1 : 0);
              return (
                <tr key={img._id} className={`transition-colors ${selectedIds.has(img._id) ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-blue-50/40"}`}>
                  <td className="px-3 py-2 w-8">
                    <input type="checkbox" checked={selectedIds.has(img._id)} onChange={() => toggleSelect(img._id)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                  </td>
                  <td className="px-3 py-2">
                    {cover ? (
                      <img src={cover} alt={img.caption} className="w-9 h-9 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300">
                        <FiImage size={14} />
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-[200px]">
                    {img.caption ? (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full truncate">
                        <FiTag size={10} /> {img.caption}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-500"><div className="max-w-[160px] truncate">{img.place || "-"}</div></td>
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                    {img.date ? new Date(img.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <FiImage size={12} /> {photoCount}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewItem(img)} className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer" title="View"><FiEye size={14} /></button>
                      <button onClick={() => openEdit(img)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg cursor-pointer" title="Edit"><FiEdit2 size={14} /></button>
                      <button onClick={() => setDeleteId(img._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer" title="Delete"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {images.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">No gallery albums yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-[2px] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300">
            {saving && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">{multiFiles.length > 0 || thumbnailFile ? "Uploading images..." : "Saving changes..."}</p>
                <p className="text-xs text-gray-400">This may take a few seconds</p>
              </div>
            )}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit Album" : "Add Album"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FiTag size={13} /> Event Tag
                </label>
                <input
                  type="text"
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  required
                  placeholder="e.g. Hackathon, Cultural Day, Team Retreat"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Shown as a small label under the place name on the gallery card.</p>
                <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={form.captionHe}
                  onChange={(e) => setForm({ ...form, captionHe: e.target.value })}
                  placeholder="תג אירוע בעברית"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><FiMapPin size={13} /> Place</label>
                  <input
                    type="text"
                    value={form.place}
                    onChange={(e) => setForm({ ...form, place: e.target.value })}
                    placeholder="Pokhara, Nepal"
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.placeHe}
                    onChange={(e) => setForm({ ...form, placeHe: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><FiCalendar size={13} /> Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* thumbnail — the cover image shown on the public gallery card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FiImage size={13} /> Thumbnail (cover photo shown on the gallery card)
                </label>
                <ImageDropzone
                  label=""
                  onFileSelect={setThumbnailFile}
                  currentImage={editing?.thumbnail || editing?.image}
                />
              </div>

              {/* album photos — the photos shown when the user opens this album */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Album Photos (add as many as you want)
                </label>

                {/* existing photos (when editing) — handle both {url, publicId} and plain strings */}
                {editing && editing.images?.length > 0 && multiFiles.length === 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {editing.images.map((src, i) => {
                      const url = typeof src === "string" ? src : src?.url;
                      return (
                        <img key={i} src={url} alt={`Existing ${i + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                      );
                    })}
                  </div>
                )}

                {/* new photo previews */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt={`Preview ${i + 1}`} className="w-full h-20 object-cover rounded-lg border border-blue-200" />
                        <button
                          type="button"
                          onClick={() => removeOne(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full transition-colors"
                          title="Remove"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultiSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg cursor-pointer transition-all border-2 border-dashed border-blue-300 bg-white/20 hover:border-blue-400 flex flex-col items-center justify-center py-6 text-gray-500"
                >
                  <FiUploadCloud size={28} className="mb-1 text-blue-500" />
                  <p className="text-sm font-medium">
                    {multiFiles.length > 0
                      ? `${multiFiles.length} photo(s) selected — click to add more`
                      : editing && editing.images?.length > 0
                      ? "Click to upload new photos (will replace current)"
                      : "Click to select multiple photos"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">These open inside the album when the thumbnail is clicked</p>
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={saving || (!editing && !thumbnailFile && multiFiles.length === 0)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer"
                >
                  <FiSave size={14} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="This album will be permanently deleted." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}

      {bulkDeleteOpen && (
        <ConfirmModal
          message={`${selectedIds.size} album${selectedIds.size > 1 ? "s" : ""} will be permanently deleted.${bulkDeleting ? " Deleting…" : ""}`}
          onConfirm={confirmBulkDelete}
          onCancel={() => !bulkDeleting && setBulkDeleteOpen(false)}
        />
      )}

      {/* VIEW modal — shows full album with all photos */}
      {viewItem && (() => {
        const cover = viewItem.thumbnail || viewItem.image || (typeof viewItem.images?.[0] === "string" ? viewItem.images[0] : viewItem.images?.[0]?.url);
        const photos = (viewItem.images || []).map((s) => (typeof s === "string" ? s : s?.url)).filter(Boolean);
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
            <div
              className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Gallery Album — Details</h3>
                <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
              </div>
              <div className="p-5 space-y-4 text-sm">
                {cover && (
                  <img src={cover} alt={viewItem.caption} className="w-full h-56 object-cover rounded-lg border border-gray-200" />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1 inline-flex items-center gap-1"><FiTag size={11} /> Event Tag</p>
                    <p className="text-blue-700 font-semibold">{viewItem.caption || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1 inline-flex items-center gap-1"><FiMapPin size={11} /> Place</p>
                    <p className="text-gray-700">{viewItem.place || "-"}</p>
                  </div>
                </div>
                {viewItem.date && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1 inline-flex items-center gap-1"><FiCalendar size={11} /> Date</p>
                    <p className="text-gray-700">{new Date(viewItem.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                )}
                {photos.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2 inline-flex items-center gap-1">
                      <FiImage size={11} /> Album Photos ({photos.length})
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {photos.map((src, i) => (
                        <img key={i} src={src} alt={`Photo ${i + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default ManageGallery;
