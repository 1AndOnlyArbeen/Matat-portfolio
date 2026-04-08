import { useState, useEffect, useRef } from "react";
import { getHero, updateHero } from "../api/admin";
import { FiSave, FiRefreshCw, FiUploadCloud, FiX } from "react-icons/fi";

function ManageHero() {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  // load current hero data
  useEffect(() => {
    getHero().then((res) => {
      if (res) {
        setForm({
          title: res.title || "",
          subtitle: res.subtitle || "",
          buttonText: res.buttonText || "",
          buttonLink: res.buttonLink || "",
        });
        if (res.backgroundImage) {
          setImagePreview(res.backgroundImage);
        }
      }
    });
  }, []);

  // update field value
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle file selection (from input or drop)
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  // remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // save changes to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("subtitle", form.subtitle);
    formData.append("buttonText", form.buttonText);
    formData.append("buttonLink", form.buttonLink);
    if (imageFile) {
      formData.append("backgroundImage", imageFile);
    }

    const result = await updateHero(formData);
    if (result) {
      setMessage("Hero updated successfully!");
    } else {
      setMessage("Failed to update hero.");
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Hero Banner</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">

        {/* title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <textarea
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        {/* button text */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input
              type="text"
              name="buttonText"
              value={form.buttonText}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
            <input
              type="text"
              name="buttonLink"
              value={form.buttonLink}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* background image drag & drop */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>

          {imagePreview ? (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-lg h-48 object-cover w-full border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FiX size={14} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-700 text-xs font-medium rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
              >
                Change Image
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50"
              }`}
            >
              <FiUploadCloud size={32} className={dragging ? "text-blue-500" : "text-gray-400"} />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
          >
            {saving ? <FiRefreshCw size={14} className="animate-spin" /> : <FiSave size={14} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && (
            <span className={`text-sm font-medium ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default ManageHero;
