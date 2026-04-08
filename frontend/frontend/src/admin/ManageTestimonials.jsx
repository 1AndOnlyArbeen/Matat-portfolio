import { useState, useEffect } from "react";
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiStar } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";

function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", company: "", text: "", rating: 5 });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    const res = await getTestimonials();
    if (res) setTestimonials(res);
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
      text: item.text,
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
    data.append("text", form.text);
    data.append("rating", form.rating);
    if (avatarFile) data.append("avatar", avatarFile);

    let result;
    if (editing) {
      result = await updateTestimonial(editing._id, data);
    } else {
      result = await createTestimonial(data);
    }

    if (result) {
      await loadTestimonials();
      setShowModal(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    const result = await deleteTestimonial(id);
    if (result) await loadTestimonials();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage Testimonials</h2>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
          <FiPlus size={16} /> Add Testimonial
        </button>
      </div>

      {/* testimonials list */}
      <div className="space-y-4">
        {testimonials.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start gap-4">
              {item.avatar && (
                <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <span className="text-gray-400 text-sm">- {item.company}</span>
                </div>
                {/* star rating display */}
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} size={14} className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
                <p className="text-gray-500 text-sm">{item.text}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg cursor-pointer"><FiEdit2 size={16} /></button>
                <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer"><FiTrash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}

        {testimonials.length === 0 && (
          <div className="text-center py-12 text-gray-400">No testimonials yet.</div>
        )}
      </div>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit Testimonial" : "Add Testimonial"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
                <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={4} required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>
              {/* star rating selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="cursor-pointer"
                    >
                      <FiStar size={24} className={star <= form.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
              </div>
              <ImageDropzone
                label="Avatar"
                onFileSelect={setAvatarFile}
                currentImage={editing?.avatar}
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer"><FiSave size={14} /> {saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTestimonials;
