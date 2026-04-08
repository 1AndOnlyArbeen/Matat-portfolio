import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProjects, createProject, updateProject, deleteProject } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiEye } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";

function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = creating new, object = editing existing
  const [form, setForm] = useState({ title: "", description: "", tags: "", link: "" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const res = await getProjects();
    if (res) setProjects(res);
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
      tags: project.tags?.join(", ") || "",
      link: project.link || "",
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
    data.append("tags", form.tags); // backend should split by comma
    data.append("link", form.link);
    if (imageFile) data.append("image", imageFile);

    let result;
    if (editing) {
      result = await updateProject(editing._id, data);
    } else {
      result = await createProject(data);
    }

    if (result) {
      await loadProjects();
      setShowModal(false);
    }

    setSaving(false);
  };

  // delete project with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    const result = await deleteProject(id);
    if (result) await loadProjects();
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
          <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* project image */}
            {project.image && (
              <img src={project.image} alt={project.title} className="w-full h-36 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">{project.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">{project.description}</p>
              {/* tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tags?.map((tag) => (
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
                  onClick={() => handleDelete(project._id)}
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

      {/* create/edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <ImageDropzone
                label="Image"
                onFileSelect={setImageFile}
                currentImage={editing?.image}
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
    </div>
  );
}

export default ManageProjects;
