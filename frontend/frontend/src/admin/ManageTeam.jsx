import { useState, useEffect } from "react";
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";

function ManageTeam() {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", linkedin: "", github: "", twitter: "" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const res = await getTeamMembers();
    if (res) setMembers(res);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", role: "", linkedin: "", github: "", twitter: "" });
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      linkedin: member.social?.linkedin || "",
      github: member.social?.github || "",
      twitter: member.social?.twitter || "",
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("name", form.name);
    data.append("role", form.role);
    data.append("linkedin", form.linkedin);
    data.append("github", form.github);
    data.append("twitter", form.twitter);
    if (imageFile) data.append("image", imageFile);

    let result;
    if (editing) {
      result = await updateTeamMember(editing._id, data);
    } else {
      result = await createTeamMember(data);
    }

    if (result) {
      await loadMembers();
      setShowModal(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team member?")) return;
    const result = await deleteTeamMember(id);
    if (result) await loadMembers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage Team</h2>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
          <FiPlus size={16} /> Add Member
        </button>
      </div>

      {/* team members grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {member.image && (
              <img src={member.image} alt={member.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">{member.name}</h3>
              <p className="text-blue-500 text-sm mb-3">{member.role}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(member)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg cursor-pointer"><FiEdit2 size={16} /></button>
                <button onClick={() => handleDelete(member._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer"><FiTrash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No team members yet.</div>
        )}
      </div>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit Member" : "Add Member"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              {/* social links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input type="text" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                  <input type="text" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                  <input type="text" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <ImageDropzone
                label="Photo"
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

export default ManageTeam;
