import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjectById } from "../api";
import { FiArrowLeft, FiExternalLink, FiCalendar, FiUser, FiX, FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";

// single project detail page — fully dynamic from backend
function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null); // null = closed, number = open at that index

  useEffect(() => {
    getProjectById(id).then((res) => {
      const list = res?.project || (Array.isArray(res) ? res : []);
      setProject(list.find((p) => p._id === id) || null);
      setLoading(false);
    }).catch(() => {
      setProject(null);
      setLoading(false);
    });
  }, [id]);

  // loading spinner
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // not found
  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <p className="text-lg mb-4">Project not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          <FiArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  // normalize screenshot array — backend may return objects {url} or plain strings
  const screenshots = (project.screenshots || [])
    .map((s) => (typeof s === "string" ? s : s?.url))
    .filter(Boolean);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevShot = () =>
    setLightboxIndex((i) => (i - 1 + screenshots.length) % screenshots.length);
  const nextShot = () =>
    setLightboxIndex((i) => (i + 1) % screenshots.length);

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* back button */}
        <Link
          to="/#projects"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 text-sm font-medium transition-colors"
        >
          <FiArrowLeft size={16} /> Back to Projects
        </Link>

        {/* hero image */}
        <div className="rounded-xl overflow-hidden mb-8 shadow-lg">
          <img
            src={project.projectImage || project.image}
            alt={project.title}
            className="w-full h-64 sm:h-80 md:h-96 object-cover"
          />
        </div>

        {/* project info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* main content - left side */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">{project.title}</h1>

            {/* tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(Array.isArray(project.tags) ? project.tags : project.tags?.split(",").map(t => t.trim()))?.map((tag) => (
                <span key={tag} className="bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* full description */}
            <p className="text-gray-600 leading-relaxed mb-6">
              {project.longDescription || project.description}
            </p>

            {/* features list */}
            {project.features && project.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* external link */}
            {(project.projectLink || project.link) && (project.projectLink || project.link) !== "#" && (
              <a
                href={project.projectLink || project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Visit Project <FiExternalLink size={16} />
              </a>
            )}
          </div>

          {/* sidebar - right side */}
          <div className="space-y-4">
            {/* project details card */}
            <div className="bg-blue-50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 uppercase tracking-wide">Project Details</h3>
              <div className="space-y-3">
                {project.client && (
                  <div className="flex items-center gap-3 text-sm">
                    <FiUser className="text-blue-500 shrink-0" size={16} />
                    <div>
                      <p className="text-gray-400 text-xs">Client</p>
                      <p className="text-gray-700 font-medium">{project.client}</p>
                    </div>
                  </div>
                )}
                {project.date && (
                  <div className="flex items-center gap-3 text-sm">
                    <FiCalendar className="text-blue-500 shrink-0" size={16} />
                    <div>
                      <p className="text-gray-400 text-xs">Date</p>
                      <p className="text-gray-700 font-medium">{project.date}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* tech stack card */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 uppercase tracking-wide">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(project.tags) ? project.tags : project.tags?.split(",").map(t => t.trim()))?.map((tag) => (
                  <span key={tag} className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* work snapshots — full-width section below the main grid */}
        {screenshots.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 inline-flex items-center gap-2">
                <FiImage className="text-blue-500" /> Snapshots
              </h2>
              <span className="text-xs text-gray-400">{screenshots.length} image{screenshots.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {screenshots.map((src, i) => (
                <button
                  key={i}
                  onClick={() => openLightbox(i)}
                  className="group relative aspect-video rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-gray-100"
                >
                  <img
                    src={src}
                    alt={`${project.title} snapshot ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/30 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-white/80">
              {lightboxIndex + 1} / {screenshots.length}
            </p>
            <button onClick={closeLightbox} className="text-white/80 hover:text-white hover:rotate-90 transition-transform p-2">
              <FiX size={28} />
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center px-4 sm:px-12" onClick={(e) => e.stopPropagation()}>
            <img
              src={screenshots[lightboxIndex]}
              alt={`Snapshot ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            {screenshots.length > 1 && (
              <>
                <button
                  onClick={prevShot}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md hover:scale-110 transition-all cursor-pointer"
                >
                  <FiChevronLeft size={26} />
                </button>
                <button
                  onClick={nextShot}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md hover:scale-110 transition-all cursor-pointer"
                >
                  <FiChevronRight size={26} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
