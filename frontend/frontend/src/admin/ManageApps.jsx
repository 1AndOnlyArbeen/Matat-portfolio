import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getApps, createApp, updateApp, deleteApp } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiEye } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";
import ConfirmModal from "./ConfirmModal";

function ManageApps() {
  const [apps, setApps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", platform: "", link: "" });
  const [iconFile, setIconFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    const res = await getApps();
    if (res) setApps(res);
  };

  // open modal in create mode
  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", platform: "", link: "" });
    setIconFile(null);
    setShowModal(true);
  };

  // open modal in edit mode with existing data
  const openEdit = (app) => {
    setEditing(app);
    setForm({
      name: app.name,
      description: app.description,
      platform: app.platform || "",
      link: app.link || "",
    });
    setIconFile(null);
    setShowModal(true);
  };

  // submit form - handles both create and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("platform", form.platform);
    data.append("link", form.link);
    if (iconFile) data.append("icon", iconFile);

    let result;
    if (editing) {
      result = await updateApp(editing._id, data);
    } else {
      result = await createApp(data);
    }

    if (result) {
      await loadApps();
      setShowModal(false);
    }
    setSaving(false);
  };

  // delete with confirmation popup
  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteApp(deleteId);
    setDeleteId(null);
    if (result) await loadApps();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage Apps</h2>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
          <FiPlus size={16} /> Add App
        </button>
      </div>

      {/* apps grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => (
          <div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              {app.icon && (
                <img src={app.icon} alt={app.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800">{app.name}</h3>
                <p className="text-blue-500 text-xs mb-1">{app.platform}</p>
                <p className="text-gray-500 text-sm line-clamp-2">{app.description}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Link to={`/matat-admin/apps/${app._id}`} className="text-gray-500 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <FiEye size={16} />
              </Link>
              <button onClick={() => openEdit(app)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer">
                <FiEdit2 size={16} />
              </button>
              <button onClick={() => setDeleteId(app._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer">
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {apps.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No apps yet. Click "Add App" to create one.
          </div>
        )}
      </div>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-[2px] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300">
            {saving && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">{iconFile ? "Uploading image..." : "Saving changes..."}</p>
                <p className="text-xs text-gray-400">This may take a few seconds</p>
              </div>
            )}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit App" : "Add New App"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <input type="text" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="iOS & Android" className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                  <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <ImageDropzone
                label="App Icon"
                onFileSelect={setIconFile}
                currentImage={editing?.icon}
              />
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
    </div>
  );
}

export default ManageApps;
