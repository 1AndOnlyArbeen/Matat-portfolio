import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProjects, createProject, updateProject, deleteProject } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";
import ConfirmModal from "./ConfirmModal";

function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", tags: "", link: "" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadProjects(page);
  }, [page]);

  const loadProjects = async (p = 1) => {
    const res = await getProjects(p, 6);
    const data = res?.data;
    const list = data?.project || [];
    if (Array.isArray(list)) setProjects(list);
    if (data?.pagination) {
      setTotalPages(data.pagination.totalPage || 1);
    }
  };

  // open modal for creating new project
  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", tags: "", link: "" });
    setImageFile(null);
    setShowModal(true);
  };

  // open modal for editing existing project
  const openEdit = (project) => {
    setEditing(project);
    setForm({
      title: project.title,
      description: project.description,
      tags: project.tags || "",
      link: project.projectLink || "",
    });
    setImageFile(null);
    setShowModal(true);
  };

  // handle form submission - create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // build form data for file upload support
    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("tags", form.tags);
    data.append("projectLink", form.link);
    if (imageFile) data.append("projectImage", imageFile);

    let result;
    if (editing) {
      result = await updateProject(editing._id, data);
    } else {
      result = await createProject(data);
    }

    if (result) {
      await loadProjects(page);
      setShowModal(false);
    }

    setSaving(false);
  };

  // delete project with confirmation
  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteProject(deleteId);
    setDeleteId(null);
    if (result) {
      if (projects.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadProjects(page);
      }
    }
  };

  return (
    <div>
      {/* header with add button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage Projects</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
        >
          <FiPlus size={16} /> Add Project
        </button>
      </div>

      {/* projects list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project._id} className="bg-white/30 backdrop-blur-xl rounded-xl border border-blue-300/40 shadow-[0_4px_20px_rgba(30,64,175,0.2)] overflow-hidden">
            {/* project image */}
            {(project.projectImage || project.image) && (
              <img src={project.projectImage || project.image} alt={project.title} className="w-full h-36 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">{project.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">{project.description}</p>
              {/* tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {(Array.isArray(project.tags) ? project.tags : project.tags?.split(",").map(t => t.trim()))?.map((tag) => (
                  <span key={tag} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              {/* action buttons */}
              <div className="flex gap-2">
                <Link
                  to={`/matat-admin/projects/${project._id}`}
                  className="text-gray-500 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <FiEye size={16} />
                </Link>
                <button
                  onClick={() => openEdit(project)}
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(project._id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* empty state */}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No projects yet. Click "Add Project" to get started.
          </div>
        )}
      </div>

      {/* pagination */}
      {totalPages > 1 && (
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
              className={`w-8 h-8 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                num === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
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

      {/* create/edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-[2px] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300">
            {/* saving overlay */}
            {saving && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">{imageFile ? "Uploading image..." : "Saving changes..."}</p>
                <p className="text-xs text-gray-400">This may take a few seconds</p>
              </div>
            )}
            {/* modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editing ? "Edit Project" : "Add New Project"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <FiX size={20} />
              </button>
            </div>

            {/* modal form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <ImageDropzone
                label="Image"
                onFileSelect={setImageFile}
                currentImage={editing?.projectImage || editing?.image}
              />

              {/* submit */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FiSave size={14} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          message="This project will be permanently deleted."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

export default ManageProjects;
