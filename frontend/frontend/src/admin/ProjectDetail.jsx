import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjects } from "../api/admin";
import { FiArrowLeft, FiEdit2, FiExternalLink, FiCalendar, FiUser } from "react-icons/fi";

// admin project detail view
// shows full project info with edit button
function AdminProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load all projects and find the one we need
    // TODO: switch to single fetch endpoint when backend is ready
    getProjects().then((res) => {
      if (res) {
        const found = res.find((p) => p._id === id);
        setProject(found || null);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">Project not found</p>
        <Link to="/matat-admin/projects" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 justify-center">
          <FiArrowLeft size={16} /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* header with back + edit */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/matat-admin/projects" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
          <FiArrowLeft size={16} /> Back
        </Link>
        <Link to="/matat-admin/projects" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
          <FiEdit2 size={14} /> Edit
        </Link>
      </div>

      {/* project image */}
      {project.image && (
        <div className="rounded-xl overflow-hidden mb-6 shadow-md">
          <img src={project.image} alt={project.title} className="w-full h-64 object-cover" />
        </div>
      )}

      {/* project info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{project.title}</h1>

        {/* tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Array.isArray(project.tags) ? project.tags : project.tags?.split(",").map(t => t.trim()))?.map((tag) => (
            <span key={tag} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">{tag}</span>
          ))}
        </div>

        {/* description */}
        <p className="text-gray-600 leading-relaxed mb-4">{project.longDescription || project.description}</p>

        {/* meta info */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-4">
          {project.client && (
            <span className="flex items-center gap-1"><FiUser size={14} /> {project.client}</span>
          )}
          {project.date && (
            <span className="flex items-center gap-1"><FiCalendar size={14} /> {project.date}</span>
          )}
          {project.link && project.link !== "#" && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
              <FiExternalLink size={14} /> Visit
            </a>
          )}
        </div>

        {/* features */}
        {project.features && project.features.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Features</h3>
            <ul className="grid grid-cols-2 gap-2">
              {project.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProjectDetail;
