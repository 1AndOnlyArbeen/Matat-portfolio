import { useState, useEffect } from "react";
import { getAbout, updateAbout } from "../api/admin";
import { FiSave, FiRefreshCw, FiPlus, FiTrash2 } from "react-icons/fi";

function ManageAbout() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    mission: "",
    stats: [{ label: "", value: "" }],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // load about data on mount
  useEffect(() => {
    getAbout().then((res) => {
      if (res) setForm(res);
    });
  }, []);

  // update a single stat field
  const updateStat = (index, field, value) => {
    const updated = [...form.stats];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, stats: updated });
  };

  // add new empty stat row
  const addStat = () => {
    setForm({ ...form, stats: [...form.stats, { label: "", value: "" }] });
  };

  // remove a stat row
  const removeStat = (index) => {
    const updated = form.stats.filter((_, i) => i !== index);
    setForm({ ...form, stats: updated });
  };

  // save to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const result = await updateAbout(form);
    if (result) {
      setMessage("About section updated!");
    } else {
      setMessage("Failed to update.");
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Manage About Section</h2>

      <form onSubmit={handleSubmit} className="relative bg-white/95 backdrop-blur-[2px] rounded-xl p-6 shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300 space-y-4">
        {saving && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-700">Saving changes...</p>
            <p className="text-xs text-gray-400">This may take a few seconds</p>
          </div>
        )}
        {/* title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        {/* mission */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
          <textarea
            value={form.mission}
            onChange={(e) => setForm({ ...form, mission: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        {/* stats - dynamic add/remove */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Stats</label>
            <button type="button" onClick={addStat} className="text-blue-600 text-sm flex items-center gap-1 cursor-pointer hover:text-blue-800">
              <FiPlus size={14} /> Add Stat
            </button>
          </div>
          <div className="space-y-2">
            {form.stats?.map((stat, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => updateStat(index, "value", e.target.value)}
                  placeholder="150+"
                  className="w-24 px-3 py-2 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(index, "label", e.target.value)}
                  placeholder="Projects Completed"
                  className="flex-1 px-3 py-2 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeStat(index)}
                  className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* save */}
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
            <span className={`text-sm font-medium ${message.includes("updated") ? "text-green-600" : "text-red-500"}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default ManageAbout;
