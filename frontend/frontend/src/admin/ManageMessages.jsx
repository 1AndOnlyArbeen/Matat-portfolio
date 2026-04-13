import { useState, useEffect } from "react";
import { getMessages, updateMessage, deleteMessage } from "../api/admin";
import {
  FiTrash2, FiMail, FiClock, FiEye, FiEdit2, FiX, FiSave,
  FiChevronLeft, FiChevronRight, FiUser,
} from "react-icons/fi";
import ConfirmModal from "./ConfirmModal";

function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [viewMsg, setViewMsg] = useState(null);
  const [editMsg, setEditMsg] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const perPage = 14;

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const res = await getMessages();
    if (res) setMessages(res);
  };

  const openEdit = (msg) => {
    setEditMsg(msg);
    setForm({
      name: msg.name || "",
      email: msg.email || "",
      subject: msg.subject || "",
      message: msg.message || "",
    });
    setSaveError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    const result = await updateMessage(editMsg._id, form);
    if (result) {
      await loadMessages();
      setEditMsg(null);
    } else {
      setSaveError("Failed to update. Backend may not support message editing yet.");
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteMessage(deleteId);
    setDeleteId(null);
    if (result) await loadMessages();
  };

  // pagination
  const totalPages = viewAll ? 1 : Math.max(1, Math.ceil(messages.length / perPage));
  const visible = viewAll ? messages : messages.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      {/* sticky header */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Contact Messages</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{messages.length} message(s)</span>
          <button
            onClick={() => { setViewAll((v) => !v); setPage(1); }}
            className="bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors"
          >
            {viewAll ? "Show Pages" : "View All"}
          </button>
        </div>
      </div>

      {/* messages table */}
      <div className="overflow-x-clip rounded-xl border border-blue-300/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(30,64,175,0.15)]">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-14 z-20 bg-blue-50 text-gray-700 text-[11px] uppercase tracking-wide shadow-[0_2px_6px_rgba(30,64,175,0.08)]">
            <tr>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Email</th>
              <th className="px-3 py-2 font-semibold">Subject</th>
              <th className="px-3 py-2 font-semibold">Message</th>
              <th className="px-3 py-2 font-semibold">Received</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/60">
            {visible.map((msg) => (
              <tr key={msg._id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-3 py-2 font-medium text-gray-800 max-w-[160px] truncate">{msg.name}</td>
                <td className="px-3 py-2 text-gray-500 max-w-[160px] truncate">
                  <span className="inline-flex items-center gap-1">
                    <FiMail size={11} /> {msg.email}
                  </span>
                </td>
                <td className="px-3 py-2 text-blue-600 font-medium max-w-[160px] truncate">{msg.subject}</td>
                <td className="px-3 py-2 text-gray-600 max-w-[240px] truncate">{msg.message}</td>
                <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                  {msg.createdAt ? (
                    <span className="inline-flex items-center gap-1">
                      <FiClock size={10} />
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  ) : "-"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setViewMsg(msg)} className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer" title="View">
                      <FiEye size={14} />
                    </button>
                    <button onClick={() => openEdit(msg)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg cursor-pointer" title="Edit">
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(msg._id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {messages.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  <FiMail size={32} className="mx-auto mb-2 opacity-40" />
                  <p>No messages yet. Messages from the contact form will appear here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {!viewAll && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`w-8 h-8 rounded-lg text-sm font-medium cursor-pointer transition-colors ${num === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}

      {/* VIEW modal */}
      {viewMsg && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewMsg(null)}>
          <div
            className="relative bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Message Details</h3>
              <button onClick={() => setViewMsg(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1 inline-flex items-center gap-1"><FiUser size={11} /> From</p>
                <p className="text-gray-800 font-semibold">{viewMsg.name}</p>
                <p className="text-blue-600 inline-flex items-center gap-1"><FiMail size={12} /> {viewMsg.email}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Subject</p>
                <p className="text-gray-800 font-medium">{viewMsg.subject || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Message</p>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{viewMsg.message}</p>
              </div>
              {viewMsg.createdAt && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1 inline-flex items-center gap-1"><FiClock size={11} /> Received</p>
                  <p className="text-gray-500 text-xs">{new Date(viewMsg.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-5 pt-0">
              <a
                href={`mailto:${viewMsg.email}?subject=Re:%20${encodeURIComponent(viewMsg.subject || "")}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <FiMail size={14} /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* EDIT modal */}
      {editMsg && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-[2px] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300">
            {saving && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">Saving changes...</p>
              </div>
            )}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Edit Message</h3>
              <button onClick={() => setEditMsg(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
              {saveError && <p className="text-sm text-red-500 font-medium">{saveError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditMsg(null)} className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer"
                >
                  <FiSave size={14} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="This message will be permanently deleted." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

export default ManageMessages;
