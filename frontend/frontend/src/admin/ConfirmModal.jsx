import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";

// shared confirm modal — automatically shows a spinner while onConfirm is in flight
// callers can optionally pass `loading` to control it externally (e.g. bulk deletes
// that already track their own deleting state).
function ConfirmModal({ message, onConfirm, onCancel, loading: externalLoading }) {
  const [processing, setProcessing] = useState(false);
  // either the parent told us we're loading (bulk delete) OR our own internal state
  const isLoading = externalLoading || processing;

  const handleConfirm = async () => {
    if (isLoading) return;
    try {
      setProcessing(true);
      await Promise.resolve(onConfirm?.());
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) return; // can't cancel mid-delete
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-xl w-full max-w-sm shadow-[0_4px_30px_rgba(30,64,175,0.3)] border border-blue-300 p-6 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          {isLoading ? (
            <span className="w-7 h-7 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
          ) : (
            <FiAlertTriangle size={28} className="text-red-500" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {isLoading ? "Deleting..." : "Are you sure?"}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {isLoading ? "Please wait, this may take a moment." : message}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
