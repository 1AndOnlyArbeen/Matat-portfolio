import { useState, useEffect } from "react";
import { getMessages, deleteMessage } from "../api/admin";
import { FiTrash2, FiMail, FiClock } from "react-icons/fi";
import ConfirmModal from "./ConfirmModal";

function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  // load contact form submissions
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const res = await getMessages();
    if (res) setMessages(res);
  };

  // delete a message
  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteMessage(deleteId);
    setDeleteId(null);
    if (result) await loadMessages();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Contact Messages</h2>
        <span className="text-sm text-gray-400">{messages.length} message(s)</span>
      </div>

      {/* messages list */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div key={msg._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* sender info */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">{msg.name}</h3>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <FiMail size={12} /> {msg.email}
                  </span>
                </div>

                {/* subject */}
                <p className="text-blue-600 text-sm font-medium mb-2">{msg.subject}</p>

                {/* message body */}
                <p className="text-gray-600 text-sm">{msg.message}</p>

                {/* timestamp if available */}
                {msg.createdAt && (
                  <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                    <FiClock size={10} />
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* delete button */}
              <button
                onClick={() => setDeleteId(msg._id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg cursor-pointer transition-colors shrink-0"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* empty state */}
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FiMail size={40} className="mx-auto mb-3 opacity-40" />
            <p>No messages yet. Messages from the contact form will appear here.</p>
          </div>
        )}
      </div>
      {deleteId && (
        <ConfirmModal message="This message will be permanently deleted." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

export default ManageMessages;
