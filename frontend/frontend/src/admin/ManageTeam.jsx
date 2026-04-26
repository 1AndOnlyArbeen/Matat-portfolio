import { useState, useEffect } from "react";
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiChevronLeft, FiChevronRight, FiGlobe, FiEye, FiLinkedin, FiGithub, FiTwitter } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";
import ConfirmModal from "./ConfirmModal";

function ManageTeam() {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", nameHe: "", role: "", roleHe: "", country: "", countryHe: "", linkedin: "", github: "", twitter: "" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  // bulk selection
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // view modal
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    loadMembers(page);
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
      prev.size === members.length ? new Set() : new Set(members.map((m) => m._id)),
    );
  const allSelected = members.length > 0 && selectedIds.size === members.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < members.length;
  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    await Promise.all(Array.from(selectedIds).map((id) => deleteTeamMember(id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    await loadMembers(page);
  };

  const loadMembers = async (p = 1) => {
    const res = await getTeamMembers(viewAll ? 1 : p, viewAll ? 1000 : 14);
    const data = res?.data;
    const list = data?.teams || (Array.isArray(data) ? data : []);
    setMembers(list);
    if (data?.pagination) {
      setTotalPages(data.pagination.totalPages || 1);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", nameHe: "", role: "", roleHe: "", country: "", countryHe: "", linkedin: "", github: "", twitter: "" });
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({
      name: member.name,
      nameHe: member.nameHe || "",
      role: member.role,
      roleHe: member.roleHe || "",
      country: member.country || "",
      countryHe: member.countryHe || "",
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
    data.append("nameHe", form.nameHe);
    data.append("role", form.role);
    data.append("roleHe", form.roleHe);
    data.append("country", form.country);
    data.append("countryHe", form.countryHe);
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
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Manage Team</h2>
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
            <FiPlus size={16} /> Add Member
          </button>
        </div>
      </div>

      {/* team members table */}
      <div className="overflow-x-auto rounded-xl border border-blue-300/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(30,64,175,0.15)]">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-14 z-20 bg-blue-50 text-gray-700 text-[11px] uppercase tracking-wide shadow-[0_2px_6px_rgba(30,64,175,0.08)]">
            <tr>
              <th className="px-3 py-2 w-8">
                <input type="checkbox" checked={allSelected} ref={(el) => el && (el.indeterminate = someSelected)} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-600 cursor-pointer" title="Select all on this page" />
              </th>
              <th className="px-3 py-2 font-semibold">Photo</th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Role</th>
              <th className="px-3 py-2 font-semibold">Country</th>
              <th className="px-3 py-2 font-semibold">LinkedIn</th>
              <th className="px-3 py-2 font-semibold">GitHub</th>
              <th className="px-3 py-2 font-semibold">Twitter</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/60">
            {members.map((member) => {
              const linkedin = member.linkedinUrl || member.social?.linkedin || "";
              const github = member.githubUrl || member.social?.github || "";
              const twitter = member.twitterUrl || member.social?.twitter || "";
              return (
                <tr key={member._id} className={`transition-colors ${selectedIds.has(member._id) ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-blue-50/40"}`}>
                  <td className="px-3 py-2 w-8">
                    <input type="checkbox" checked={selectedIds.has(member._id)} onChange={() => toggleSelect(member._id)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                  </td>
                  <td className="px-3 py-2">
                    {(member.teamImage || member.image) && (
                      <img
                        src={member.teamImage || member.image}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-800 max-w-[160px] truncate">{member.name}</td>
                  <td className="px-3 py-2 text-blue-500 max-w-[160px] truncate">{member.role}</td>
                  <td className="px-3 py-2 text-gray-600 max-w-[140px] truncate">
                    {member.country ? (
                      <span className="inline-flex items-center gap-1"><FiGlobe size={11} /> {member.country}</span>
                    ) : "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-500 max-w-[160px] truncate">
                    {linkedin ? <a href={linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-600">{linkedin}</a> : "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-500 max-w-[160px] truncate">
                    {github ? <a href={github} target="_blank" rel="noreferrer" className="hover:text-blue-600">{github}</a> : "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-500 max-w-[160px] truncate">
                    {twitter ? <a href={twitter} target="_blank" rel="noreferrer" className="hover:text-blue-600">{twitter}</a> : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewItem(member)} className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer" title="View"><FiEye size={14} /></button>
                      <button onClick={() => openEdit(member)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg cursor-pointer" title="Edit"><FiEdit2 size={14} /></button>
                      <button onClick={() => setDeleteId(member._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer" title="Delete"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {members.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400">No team members yet.</td>
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
                  <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                  <input type="text" dir="rtl" value={form.nameHe} onChange={(e) => setForm({ ...form, nameHe: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                  <input type="text" dir="rtl" value={form.roleHe} onChange={(e) => setForm({ ...form, roleHe: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FiGlobe size={13} /> Country
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="Nepal"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={form.countryHe}
                  onChange={(e) => setForm({ ...form, countryHe: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
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
              <div>
                <ImageDropzone label="Photo" onFileSelect={setImageFile} currentImage={editing?.teamImage || editing?.image} />
                <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  Note: upload a photo with a <strong>transparent / background-less</strong> image (PNG with no background).
                  Photos with a solid background will look out of place inside the framed card.
                </p>
              </div>
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

      {bulkDeleteOpen && (
        <ConfirmModal
          message={`${selectedIds.size} team member${selectedIds.size > 1 ? "s" : ""} will be permanently deleted.${bulkDeleting ? " Deleting…" : ""}`}
          onConfirm={confirmBulkDelete}
          onCancel={() => !bulkDeleting && setBulkDeleteOpen(false)}
        />
      )}

      {/* VIEW modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
          <div
            className="relative bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Team Member — Details</h3>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
                {(viewItem.teamImage || viewItem.image) ? (
                  <img src={viewItem.teamImage || viewItem.image} alt={viewItem.name} className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 mb-3" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">No photo</div>
                )}
                <h4 className="text-xl font-bold text-gray-800">{viewItem.name}</h4>
                <p className="text-blue-500 text-sm">{viewItem.role}</p>
                {viewItem.country && (
                  <p className="text-gray-500 text-xs inline-flex items-center gap-1 mt-1">
                    <FiGlobe size={12} /> {viewItem.country}
                  </p>
                )}
              </div>
              {(viewItem.linkedinUrl || viewItem.githubUrl || viewItem.twitterUrl) && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Social</p>
                  <div className="flex flex-col gap-2">
                    {viewItem.linkedinUrl && (
                      <a href={viewItem.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 break-all">
                        <FiLinkedin size={14} className="shrink-0" /> {viewItem.linkedinUrl}
                      </a>
                    )}
                    {viewItem.githubUrl && (
                      <a href={viewItem.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 break-all">
                        <FiGithub size={14} className="shrink-0" /> {viewItem.githubUrl}
                      </a>
                    )}
                    {viewItem.twitterUrl && (
                      <a href={viewItem.twitterUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-700 break-all">
                        <FiTwitter size={14} className="shrink-0" /> {viewItem.twitterUrl}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTeam;
