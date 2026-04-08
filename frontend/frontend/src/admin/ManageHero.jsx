import { useState, useEffect } from "react";
import { getHero, updateHero } from "../api/admin";
import { FiSave, FiRefreshCw } from "react-icons/fi";

function ManageHero() {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    backgroundImage: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // load current hero data
  useEffect(() => {
    getHero().then((res) => {
      if (res) setForm(res);
    });
  }, []);

  // update field value
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // save changes to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const result = await updateHero(form);
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

        {/* background image url */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL</label>
          <input
            type="text"
            name="backgroundImage"
            value={form.backgroundImage}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {/* preview */}
          {form.backgroundImage && (
            <img src={form.backgroundImage} alt="Preview" className="mt-2 rounded-lg h-32 object-cover w-full" />
          )}
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
