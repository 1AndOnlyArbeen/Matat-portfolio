import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { getProjects } from "../api";
import useLang from "../hooks/useLang";
import useSectionHeading from "../hooks/useSectionHeading";

function AllProjects() {
  const { t } = useTranslation();
  const l = useLang();
  const heading = useSectionHeading("projects");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then((res) => {
        const list = res?.project || res?.projects || (Array.isArray(res) ? res : []);
        setProjects(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-[3px] border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-20 sm:py-28 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[#0075ff] hover:text-[#051229] font-bold text-sm mb-8 transition-colors">
          <FiArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-12 sm:mb-16">
          {heading.label && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0075ff]/5 border border-[#0075ff]/10 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0075ff] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0075ff]" />
              </span>
              <span className="text-xs font-bold tracking-widest text-[#0075ff] uppercase">{heading.label}</span>
            </div>
          )}
          {(heading.titlePlain || heading.titleHighlight) && (
            <h2 className="section-title">
              {heading.titlePlain}{heading.titlePlain && heading.titleHighlight && " "}
              {heading.titleHighlight && <span className="text-[#0075ff]">{heading.titleHighlight}</span>}
            </h2>
          )}
          {heading.subtitle && <p className="text-[#7e8590] max-w-xl mx-auto text-base">{heading.subtitle}</p>}
        </div>

        {projects.length === 0 ? (
          <p className="text-center text-[#7e8590] py-20">No projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const tags = Array.isArray(l(project, "tags"))
                ? l(project, "tags")
                : l(project, "tags")?.split(",").map((s) => s.trim()) || [];
              return (
                <div key={project._id} className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/80 group card-hover flex flex-col">
                  <div className="overflow-hidden h-48 hover-shine shrink-0">
                    <img src={project.projectImage || project.image} alt={l(project, "title")} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-[#051229] mb-2">{l(project, "title")}</h3>
                    <p className="text-[#7e8590] text-sm mb-3 line-clamp-2">{l(project, "description")}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map((tag) => (
                        <span key={tag} className="bg-[#dfecfd] text-[#0075ff] text-xs px-2.5 py-1 rounded-full font-semibold">{tag}</span>
                      ))}
                    </div>
                    <Link to={`/projects/${project._id}`} className="inline-flex items-center gap-1.5 text-[#0075ff] hover:text-[#051229] text-sm font-bold transition-colors link-underline mt-auto">
                      {t("projects.viewProject")} <FiExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default AllProjects;
