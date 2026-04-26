import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getApps, createApp, updateApp, deleteApp, replaceAppScreenshots } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiEye, FiUploadCloud, FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";
import ConfirmModal from "./ConfirmModal";

function ManageApps() {
  const [apps, setApps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", platform: "", link: "", rating: 0, appNameHe: "", descriptionHe: "", platformHe: "" });
  const [iconFile, setIconFile] = useState(null);
  const [screenshotFiles, setScreenshotFiles] = useState([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const ssInputRef = useRef(null);

  // bulk selection
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    loadApps(page);
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
      prev.size === apps.length ? new Set() : new Set(apps.map((a) => a._id)),
    );
  const allSelected = apps.length > 0 && selectedIds.size === apps.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < apps.length;
  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    await Promise.all(Array.from(selectedIds).map((id) => deleteApp(id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    await loadApps(page);
  };

  const loadApps = async (p = 1) => {
    const res = await getApps(viewAll ? 1 : p, viewAll ? 1000 : 14);
    const data = res?.data;
    const list = data?.apps || (Array.isArray(data) ? data : []);
    setApps(list);
    if (data?.pagination) {
      setTotalPages(data.pagination.totalPages || 1);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", platform: "", link: "", rating: 0, appNameHe: "", descriptionHe: "", platformHe: "" });
    setIconFile(null);
    setScreenshotFiles([]);
    setScreenshotPreviews([]);
    setShowModal(true);
  };

  const openEdit = (app) => {
    setEditing(app);
    setForm({
      name: app.appName || app.name,
      description: app.description,
      platform: app.platform || "",
      link: app.link || "",
      rating: app.rating || 0,
      appNameHe: app.appNameHe || "",
      descriptionHe: app.descriptionHe || "",
      platformHe: app.platformHe || "",
    });
    setIconFile(null);
    setScreenshotFiles([]);
    setScreenshotPreviews([]);
    setShowModal(true);
  };

  // APPENDS new files to the existing selection (admin can keep clicking to add more)
  const handleScreenshots = (e) => {
    const incoming = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
    if (incoming.length === 0) return;
    setScreenshotFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const fresh = incoming.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
      const merged = [...prev, ...fresh];
      setScreenshotPreviews(merged.map((f) => URL.createObjectURL(f)));
      return merged;
    });
    e.target.value = "";
  };

  const removeScreenshot = (index) => {
    setScreenshotFiles(prev => prev.filter((_, i) => i !== index));
    setScreenshotPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // two-step save so screenshots go through their dedicated endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // step 1 — save main app fields (no screenshots in this payload)
    const data = new FormData();
    data.append("appName", form.name);
    data.append("description", form.description);
    data.append("platform", form.platform);
    data.append("link", form.link);
    data.append("rating", form.rating);
    data.append("appNameHe", form.appNameHe);
    data.append("descriptionHe", form.descriptionHe);
    data.append("platformHe", form.platformHe);
    if (iconFile) data.append("appIcon", iconFile);

    let result;
    if (editing) {
      result = await updateApp(editing._id, data);
    } else {
      result = await createApp(data);
    }

    if (!result) {
      setSaving(false);
      return;
    }

    // step 2 — push screenshots to dedicated endpoint (if any picked)
    if (screenshotFiles.length > 0) {
      const appId = result?.data?._id || editing?._id;
      if (appId) {
        const ssData = new FormData();
        for (const f of screenshotFiles) {
          ssData.append("screenshots", f);
        }
        await replaceAppScreenshots(appId, ssData);
      }
    }

    await loadApps(page);
    setShowModal(false);
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteApp(deleteId);
    setDeleteId(null);
    if (result) {
      if (apps.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadApps(page);
      }
    }
  };

  const existingScreenshots = editing?.screenshots?.map(s => s.url || s) || [];

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-800">Manage Apps</h2>
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
            <FiPlus size={16} /> Add App
          </button>
        </div>
      </div>

      {/* apps table */}
      <div className="overflow-x-auto rounded-xl border border-blue-300/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(30,64,175,0.15)]">
        <table className="admin-list-table w-full sm:min-w-[760px] text-xs text-left">
          <thead className="sticky top-14 z-20 bg-blue-50 text-gray-700 text-[11px] uppercase tracking-wide shadow-[0_2px_6px_rgba(30,64,175,0.08)]">
            <tr>
              <th className="px-3 py-2 w-8">
                <input type="checkbox" checked={allSelected} ref={(el) => el && (el.indeterminate = someSelected)} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-600 cursor-pointer" title="Select all on this page" />
              </th>
              <th className="px-3 py-2 font-semibold">Icon</th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Platform</th>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 font-semibold">Rating</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/60">
            {apps.map((app) => (
              <tr key={app._id} className={`transition-colors ${selectedIds.has(app._id) ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-blue-50/40"}`}>
                <td className="px-3 py-2 w-8">
                  <input type="checkbox" checked={selectedIds.has(app._id)} onChange={() => toggleSelect(app._id)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                </td>
                <td className="px-3 py-2">
                  {(app.appIcon || app.icon) && (
                    <img
                      src={app.appIcon || app.icon}
                      alt={app.appName || app.name}
                      className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                </td>
                <td className="px-3 py-2 font-medium text-gray-800"><div className="max-w-[160px] truncate">{app.appName || app.name}</div></td>
                <td className="px-3 py-2 text-blue-500"><div className="max-w-[160px] truncate">{app.platform || "-"}</div></td>
                <td className="px-3 py-2 text-gray-500"><div className="max-w-[240px] truncate">{app.description}</div></td>
                <td className="px-3 py-2">
                  {app.rating > 0 ? (
                    <div className="flex items-center gap-1">
                      <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-500">{app.rating}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/matat-admin/apps/${app._id}`} className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                      <FiEye size={14} />
                    </Link>
                    <button onClick={() => openEdit(app)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(app._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {apps.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No apps yet. Click "Add App" to create one.
                </td>
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
                <p className="text-sm font-medium text-gray-700">{iconFile || screenshotFiles.length > 0 ? "Uploading images..." : "Saving changes..."}</p>
                <p className="text-xs text-gray-400">This may take a few seconds</p>
              </div>
            )}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit App" : "Add New App"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Name (EN)</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">App Name (HE)</label>
                <input type="text" dir="rtl" value={form.appNameHe} onChange={(e) => setForm({ ...form, appNameHe: e.target.value })} placeholder="שם האפליקציה בעברית..." className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description (HE)</label>
                <textarea dir="rtl" value={form.descriptionHe} onChange={(e) => setForm({ ...form, descriptionHe: e.target.value })} rows={3} placeholder="תיאור בעברית..." className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform (EN)</label>
                  <input type="text" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="iOS & Android" className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                  <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Platform (HE)</label>
                <input type="text" dir="rtl" value={form.platformHe} onChange={(e) => setForm({ ...form, platformHe: e.target.value })} placeholder="פלטפורמה בעברית..." className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              {/* rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star === form.rating ? 0 : star })}
                      className="cursor-pointer transition-colors"
                    >
                      <FiStar
                        size={22}
                        className={star <= form.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                      />
                    </button>
                  ))}
                  {form.rating > 0 && (
                    <span className="text-sm text-gray-500 ml-2 self-center">{form.rating} / 5</span>
                  )}
                </div>
              </div>

              <ImageDropzone
                label="App Icon"
                onFileSelect={setIconFile}
                currentImage={editing?.appIcon || editing?.icon}
              />

              {/* screenshots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Snapshots (up to 12)</label>

                {/* existing screenshots when editing */}
                {editing && existingScreenshots.length > 0 && screenshotFiles.length === 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {existingScreenshots.map((src, i) => (
                      <img key={i} src={src} alt={`Snapshot ${i + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                    ))}
                  </div>
                )}

                {/* new screenshot previews */}
                {screenshotPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {screenshotPreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt={`New ${i + 1}`} className="w-full h-20 object-cover rounded-lg border border-blue-200" />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full transition-colors"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={ssInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshots}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => ssInputRef.current?.click()}
                  className="w-full rounded-lg cursor-pointer transition-all border-2 border-dashed border-blue-300 bg-white/20 hover:border-blue-400 flex flex-col items-center justify-center py-5 text-gray-400"
                >
                  <FiUploadCloud size={24} className="mb-1" />
                  <p className="text-xs font-medium">
                    {screenshotFiles.length > 0
                      ? `${screenshotFiles.length} snapshot(s) selected — click to add more`
                      : editing && existingScreenshots.length > 0
                      ? "Click to upload new snapshots (will replace existing)"
                      : "Click to upload snapshots"}
                  </p>
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
                  <FiSave size={14} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="This app will be permanently deleted." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}

      {bulkDeleteOpen && (
        <ConfirmModal
          message={`${selectedIds.size} app${selectedIds.size > 1 ? "s" : ""} will be permanently deleted.${bulkDeleting ? " Deleting…" : ""}`}
          onConfirm={confirmBulkDelete}
          onCancel={() => !bulkDeleting && setBulkDeleteOpen(false)}
        />
      )}
    </div>
  );
}

export default ManageApps;
