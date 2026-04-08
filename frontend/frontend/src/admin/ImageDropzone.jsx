import { useState, useRef } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";

function ImageDropzone({ onFileSelect, currentImage, label = "Upload Image" }) {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    onFileSelect(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const shown = preview || currentImage;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : shown
              ? "border-gray-200 bg-gray-50"
              : "border-gray-300 hover:border-blue-400 bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {shown ? (
          <div className="relative p-2">
            <img
              src={shown}
              alt="Preview"
              className="w-full h-40 object-contain rounded"
            />
            <button
              type="button"
              onClick={clear}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <FiUploadCloud size={32} className="mb-2" />
            <p className="text-sm font-medium">Drag & drop or click to upload</p>
            <p className="text-xs mt-1">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageDropzone;
