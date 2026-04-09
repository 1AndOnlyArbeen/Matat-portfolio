import { FiAlertTriangle } from "react-icons/fi";

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-xl w-full max-w-sm shadow-[0_4px_30px_rgba(30,64,175,0.3)] border border-blue-300 p-6 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <FiAlertTriangle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Are you sure?</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
