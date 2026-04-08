import { useState, useEffect } from "react";
import { getGalleryImages, uploadGalleryImage, updateGalleryImage, deleteGalleryImage } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";

function ManageGallery() {
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const res = await getGalleryImages();
    if (res) setImages(res);
  };

  const openCreate = () => {
    setEditing(null);
    setCaption("");
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (img) => {
    setEditing(img);
    setCaption(img.caption || "");
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("caption", caption);
    if (imageFile) data.append("image", imageFile);

    let result;
    if (editing) {
      result = await updateGalleryImage(editing._id, data);
    } else {
      result = await uploadGalleryImage(data);
    }

    if (result) {
      await loadImages();
      setShowModal(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    const result = await deleteGalleryImage(id);
    if (result) await loadImages();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage Gallery</h2>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
          <FiPlus size={16} /> Upload Image
        </button>
      </div>

      {/* gallery grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img._id} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <img src={img.image} alt={img.caption} className="w-full aspect-square object-cover" />
            {/* overlay with caption and actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col justify-end">
              <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white text-sm mb-2">{img.caption}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(img)} className="bg-white/20 text-white p-1.5 rounded-lg hover:bg-white/30 cursor-pointer"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(img._id)} className="bg-white/20 text-white p-1.5 rounded-lg hover:bg-red-500/80 cursor-pointer"><FiTrash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No gallery images yet.</div>
        )}
      </div>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit Image" : "Upload Image"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <ImageDropzone
                label="Image"
                onFileSelect={setImageFile}
                currentImage={editing?.image}
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

export default ManageGallery;
