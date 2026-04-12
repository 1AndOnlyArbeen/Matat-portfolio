import { useState, useEffect } from "react";
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";
import ConfirmModal from "./ConfirmModal";

function ManageTeam() {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", linkedin: "", github: "", twitter: "" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadMembers(page);
  }, [page]);

  const loadMembers = async (p = 1) => {
    const res = await getTeamMembers(p, 6);
    const data = res?.data;
    const list = data?.teams || (Array.isArray(data) ? data : []);
    setMembers(list);
    if (data?.pagination) {
      setTotalPages(data.pagination.totalPages || 1);
    }
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
      linkedin: member.linkedinUrl || member.social?.linkedin || "",
      github: member.githubUrl || member.social?.github || "",
      twitter: member.twitterUrl || member.social?.twitter || "",
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
    data.append("linkedinUrl", form.linkedin);
    data.append("githubUrl", form.github);
    data.append("twitterUrl", form.twitter);
    if (imageFile) data.append("teamImage", imageFile);

    let result;
    if (editing) {
      result = await updateTeamMember(editing._id, data);
    } else {
      result = await createTeamMember(data);
    }

    if (result) {
      await loadMembers(page);
      setShowModal(false);
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteTeamMember(deleteId);
    setDeleteId(null);
    if (result) {
      if (members.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadMembers(page);
      }
    }
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
            {(member.teamImage || member.image) && (
              <img src={member.teamImage || member.image} alt={member.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">{member.name}</h3>
              <p className="text-blue-500 text-sm mb-3">{member.role}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(member)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg cursor-pointer"><FiEdit2 size={16} /></button>
                <button onClick={() => setDeleteId(member._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer"><FiTrash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No team members yet.</div>
        )}
      </div>

      {/* pagination */}
      {totalPages > 1 && (
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
                <p className="text-sm font-medium text-gray-700">{imageFile ? "Uploading image..." : "Saving changes..."}</p>
                <p className="text-xs text-gray-400">This may take a few seconds</p>
              </div>
            )}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit Member" : "Add Member"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input type="text" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                  <input type="text" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                  <input type="text" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <ImageDropzone label="Photo" onFileSelect={setImageFile} currentImage={editing?.teamImage || editing?.image} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer"><FiSave size={14} /> {saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="This team member will be permanently deleted." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

export default ManageTeam;
