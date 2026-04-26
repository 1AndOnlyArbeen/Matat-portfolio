import { useState, useEffect } from "react";
import { getMessages, deleteMessage } from "../api/admin";
import {
  FiTrash2, FiMail, FiClock, FiEye, FiX,
  FiChevronLeft, FiChevronRight, FiUser, FiCheckCircle,
} from "react-icons/fi";
import ConfirmModal from "./ConfirmModal";
import { isRead, markRead, markUnread, markAllRead, onReadChange, getReadIds } from "./messageReadStore";

function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [viewMsg, setViewMsg] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewAll, setViewAll] = useState(false);

  // bulk selection
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // trigger re-render when read state changes (counts + badges update)
  const [, setReadTick] = useState(0);
  useEffect(() => onReadChange(() => setReadTick((t) => t + 1)), []);

  useEffect(() => {
    loadMessages(page);
    // clear selection whenever page changes
    setSelectedIds(new Set());
  }, [page, viewAll]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === messages.length) return new Set();
      return new Set(messages.map((m) => m._id));
    });
  };
  const allSelected = messages.length > 0 && selectedIds.size === messages.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < messages.length;

  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    await Promise.all(Array.from(selectedIds).map((id) => deleteMessage(id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    await loadMessages(page);
  };

  // backend returns { data: { message: [...], pagination: {...} } }
  // note: field name is singular `message` even though it's an array
  const loadMessages = async (p = 1) => {
    const res = await getMessages(viewAll ? 1 : p, viewAll ? 1000 : 14);
    const data = res?.data;
    const list = data?.message || [];
    setMessages(Array.isArray(list) ? list : []);
    if (data?.pagination) {
      setTotalPages(data.pagination.totalPages || 1);
      setTotalItems(data.pagination.totalItems || 0);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteMessage(deleteId);
    setDeleteId(null);
    if (result) {
      if (messages.length === 1 && page > 1) setPage(page - 1);
      else await loadMessages(page);
    }
  };

  return (
    <div>
      {/* sticky header */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800">Contact Messages</h2>
          {(() => {
            const unread = messages.filter((m) => !isRead(m._id)).length;
            return unread > 0 ? (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                {unread} unread
              </span>
            ) : null;
          })()}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{totalItems} total</span>
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-3 py-2 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
              >
                <FiX size={13} /> Unselect All ({selectedIds.size})
              </button>
              <button
                onClick={() => {
                  const ids = Array.from(selectedIds);
                  // if every selected is already read → mark them ALL as unread; otherwise mark them all as read
                  const allRead = ids.every((id) => isRead(id));
                  if (allRead) ids.forEach((id) => markUnread(id));
                  else markAllRead(ids);
                }}
                className="bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
              >
                <FiCheckCircle size={13} />
                {Array.from(selectedIds).every((id) => isRead(id)) ? "Mark as Unread" : "Mark as Read"} ({selectedIds.size})
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
            onClick={() => markAllRead(messages.map((m) => m._id))}
            disabled={messages.every((m) => isRead(m._id))}
            className="bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium px-3 py-2 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
            title="Mark all visible messages as read"
          >
            <FiCheckCircle size={13} /> Mark all read
          </button>
          <button
            onClick={() => { setViewAll((v) => !v); setPage(1); }}
            className="bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors"
          >
            {viewAll ? "Show Pages" : "View All"}
          </button>
        </div>
      </div>

      {/* messages table */}
      <div className="overflow-x-auto rounded-xl border border-blue-300/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(30,64,175,0.15)]">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-14 z-20 bg-blue-50 text-gray-700 text-[11px] uppercase tracking-wide shadow-[0_2px_6px_rgba(30,64,175,0.08)]">
            <tr>
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => el && (el.indeterminate = someSelected)}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                  title="Select all on this page"
                />
              </th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Email</th>
              <th className="px-3 py-2 font-semibold">Subject</th>
              <th className="px-3 py-2 font-semibold">Message</th>
              <th className="px-3 py-2 font-semibold">Received</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/60">
            {messages.map((msg) => {
              const read = isRead(msg._id);
              const isSelected = selectedIds.has(msg._id);
              return (
                <tr
                  key={msg._id}
                  className={`transition-colors ${isSelected ? "bg-red-50/60 hover:bg-red-50" : read ? "hover:bg-blue-50/40" : "bg-blue-50/70 hover:bg-blue-100/60 font-semibold"}`}
                >
                  <td className="px-3 py-2 w-8">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(msg._id)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {!read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Unread" />}
                      <span className={`${read ? "text-gray-800" : "text-gray-900 font-bold"} max-w-[140px] truncate`}>
                        {msg.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-500 max-w-[160px] truncate">
                    <span className="inline-flex items-center gap-1">
                      <FiMail size={11} /> {msg.email}
                    </span>
                  </td>
                  <td className={`px-3 py-2 max-w-[160px] truncate ${read ? "text-blue-600 font-medium" : "text-blue-700 font-bold"}`}>
                    {msg.subject || "-"}
                  </td>
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
                      <button
                        onClick={() => (read ? markUnread(msg._id) : markRead(msg._id))}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                          read
                            ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                        title={read ? "Mark as unread" : "Mark as read"}
                      >
                        <FiCheckCircle size={12} />
                        {read ? "Mark as Unread" : "Mark as Read"}
                      </button>
                      <button
                        onClick={() => { setViewMsg(msg); markRead(msg._id); }}
                        className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer"
                        title="View"
                      >
                        <FiEye size={14} />
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
              );
            })}

            {messages.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
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
            <div className="flex flex-wrap justify-end gap-2 p-5 pt-0">
              {isRead(viewMsg._id) ? (
                <button
                  onClick={() => markUnread(viewMsg._id)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FiCheckCircle size={14} /> Mark as Unread
                </button>
              ) : (
                <button
                  onClick={() => markRead(viewMsg._id)}
                  className="bg-white border border-blue-300 hover:bg-blue-50 text-blue-600 font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FiCheckCircle size={14} /> Mark as Read
                </button>
              )}
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

      {deleteId && (
        <ConfirmModal message="This message will be permanently deleted." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}

      {bulkDeleteOpen && (
        <ConfirmModal
          message={`${selectedIds.size} message${selectedIds.size > 1 ? "s" : ""} will be permanently deleted.${bulkDeleting ? " Deleting…" : ""}`}
          onConfirm={confirmBulkDelete}
          onCancel={() => !bulkDeleting && setBulkDeleteOpen(false)}
        />
      )}
    </div>
  );
}

export default ManageMessages;
