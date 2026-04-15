import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useLang from "../hooks/useLang";
import { getProjectById } from "../api";
import { FiArrowLeft, FiExternalLink, FiCalendar, FiUser, FiX, FiChevronLeft, FiChevronRight, FiImage, FiArrowRight } from "react-icons/fi";

function ProjectDetail() {
  const { t } = useTranslation();
  const l = useLang();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#7e8590]">
        <p className="text-lg mb-4">{t("projectDetail.notFound")}</p>
        <Link to="/" className="text-[#0075ff] hover:text-[#051229] flex items-center gap-2 font-bold">
          <FiArrowLeft size={16} /> {t("projectDetail.backHome")}
        </Link>
      </div>
    );
  }

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
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          to="/#projects"
          className="inline-flex items-center gap-2 text-[#0075ff] hover:text-[#051229] mb-8 text-sm font-bold transition-colors link-underline"
        >
          <FiArrowLeft size={16} /> {t("projectDetail.backToProjects")}
        </Link>

        <div className="rounded-2xl overflow-hidden mb-8 shadow-[0_20px_60px_rgba(5,18,41,0.15)] hover-shine">
          <img
            src={project.projectImage || project.image}
            alt={l(project, "title")}
            className="w-full h-64 sm:h-80 md:h-96 object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl sm:text-4xl font-black text-[#051229] mb-4">{l(project, "title")}</h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {(Array.isArray(l(project, "tags")) ? l(project, "tags") : l(project, "tags")?.split(",").map(t => t.trim()))?.map((tag) => (
                <span key={tag} className="bg-[#dfecfd] text-[#0075ff] text-sm px-3 py-1 rounded-full font-semibold">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-[#364052] leading-relaxed mb-6">{l(project, "description")}</p>

            {project.features && project.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#051229] mb-3">{t("projectDetail.keyFeatures")}</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-[#364052] text-sm">
                      <span className="w-1.5 h-1.5 bg-[#0075ff] rounded-full shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(project.projectLink || project.link) && (project.projectLink || project.link) !== "#" && (
              <a
                href={project.projectLink || project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solvior inline-flex"
              >
                <span className="btn-icon"><FiExternalLink size={18} /></span>
                <span className="btn-text">{t("projectDetail.visitProject")}</span>
              </a>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-[#dfecfd]/50 rounded-2xl p-5 border border-[#0075ff]/10">
              <h3 className="text-sm font-bold text-[#051229] mb-3 uppercase tracking-wide">{t("projectDetail.projectDetails")}</h3>
              <div className="space-y-3">
                {project.client && (
                  <div className="flex items-center gap-3 text-sm">
                    <FiUser className="text-[#0075ff] shrink-0" size={16} />
                    <div>
                      <p className="text-[#7e8590] text-xs">{t("projectDetail.client")}</p>
                      <p className="text-[#051229] font-bold">{project.client}</p>
                    </div>
                  </div>
                )}
                {project.date && (
                  <div className="flex items-center gap-3 text-sm">
                    <FiCalendar className="text-[#0075ff] shrink-0" size={16} />
                    <div>
                      <p className="text-[#7e8590] text-xs">{t("projectDetail.date")}</p>
                      <p className="text-[#051229] font-bold">{project.date}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#e1e8f0]/50 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[#051229] mb-3 uppercase tracking-wide">{t("projectDetail.techStack")}</h3>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(l(project, "tags")) ? l(project, "tags") : l(project, "tags")?.split(",").map(t => t.trim()))?.map((tag) => (
                  <span key={tag} className="bg-white text-[#364052] text-xs px-3 py-1.5 rounded-lg border border-[#ced7e0] font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {screenshots.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#051229] inline-flex items-center gap-2">
                <FiImage className="text-[#0075ff]" /> {t("projectDetail.snapshots")}
              </h2>
              <span className="text-xs text-[#7e8590]">{screenshots.length} {screenshots.length > 1 ? t("projectDetail.images") : t("projectDetail.image")}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {screenshots.map((src, i) => (
                <button
                  key={i}
                  onClick={() => openLightbox(i)}
                  className="group relative aspect-video rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(5,18,41,0.12)] hover:shadow-[0_20px_50px_rgba(0,117,255,0.2)] transition-all duration-300 bg-[#e1e8f0]"
                >
                  <img src={src} alt={`${l(project, "title")} snapshot ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-[#051229]/0 group-hover:bg-[#051229]/30 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-[#051229]/95 z-50 flex flex-col backdrop-blur-md" onClick={closeLightbox}>
          <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-white/80">{lightboxIndex + 1} / {screenshots.length}</p>
            <button onClick={closeLightbox} className="text-white/80 hover:text-white hover:rotate-90 transition-transform p-2">
              <FiX size={28} />
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center px-4 sm:px-12" onClick={(e) => e.stopPropagation()}>
            <img src={screenshots[lightboxIndex]} alt={`Snapshot ${lightboxIndex + 1}`} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
            {screenshots.length > 1 && (
              <>
                <button onClick={prevShot} className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-[#0075ff] text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md hover:scale-110 transition-all cursor-pointer">
                  <FiChevronLeft size={26} />
                </button>
                <button onClick={nextShot} className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-[#0075ff] text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md hover:scale-110 transition-all cursor-pointer">
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
