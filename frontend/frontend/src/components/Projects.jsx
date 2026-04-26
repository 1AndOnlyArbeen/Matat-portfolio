import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProjects } from "../api";
import useLang from "../hooks/useLang";
import { FiExternalLink, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import useSectionHeading from "../hooks/useSectionHeading";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function Projects() {
  const { t } = useTranslation();
  const heading = useSectionHeading("projects");
  const l = useLang();
  const [projects, setProjects] = useState([]);
  const [headingRef, headingVisible] = useScrollAnimation(0.15, true);
  const [sliderRef, sliderVisible] = useScrollAnimation(0.1, true);

  useEffect(() => {
    getProjects()
      .then((res) => {
        const list = res?.project || (Array.isArray(res) ? res : []);
        if (list.length > 0) setProjects(list);
      })
      .catch(() => {});
  }, []);

  if (projects.length === 0) return null;

  return (
    <section id="projects" className="relative py-24 sm:py-28 bg-transparent overflow-hidden">
      {/* decorative shapes */}
      <div className="absolute top-10 -right-10 w-48 h-48 bg-[#0075ff]/5 rounded-full blur-2xl animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-10 -left-10 w-36 h-36 bg-[#0075ff]/5 rounded-full blur-2xl animate-pulse-glow pointer-events-none" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading — every piece is admin-driven */}
        <div ref={headingRef} className={`text-center mb-14 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          {heading.label && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0075ff]/5 border border-[#0075ff]/10 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0075ff] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0075ff]" />
              </span>
              <span className="text-xs font-bold tracking-widest text-[#0075ff] uppercase">
                {heading.label}
              </span>
            </div>
          )}
          {(heading.titlePlain || heading.titleHighlight) && (
            <h2 className="section-title">
              {heading.titlePlain}
              {heading.titlePlain && heading.titleHighlight && " "}
              {heading.titleHighlight && (
                <span className="text-[#0075ff]">{heading.titleHighlight}</span>
              )}
            </h2>
          )}
          {heading.subtitle && (
            <p className="text-[#7e8590] max-w-xl mx-auto text-base">{heading.subtitle}</p>
          )}
        </div>

        {/* project slider */}
        <div ref={sliderRef} className={`relative animate-fade-up ${sliderVisible ? "visible" : ""}`}>
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: ".projects-prev",
              nextEl: ".projects-next",
            }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            loop={projects.length > 3}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {projects.map((project) => (
              <SwiperSlide key={project._id} className="!h-auto">
                <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.10)] hover:shadow-[0_22px_50px_rgba(0,0,0,0.28),0_4px_14px_rgba(0,0,0,0.16)] hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden group h-full flex flex-col">
                  {/* project thumbnail */}
                  <div className="overflow-hidden h-48 shrink-0 hover-shine">
                    <img
                      src={project.projectImage || project.image}
                      alt={l(project, "title")}
                      className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
                    />
                  </div>

                  {/* project info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-[#051229] mb-2">{l(project, "title")}</h3>
                    <p className="text-[#7e8590] text-sm mb-3 line-clamp-2">{l(project, "description")}</p>

                    {/* tech tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(Array.isArray(l(project, "tags")) ? l(project, "tags") : l(project, "tags")?.split(",").map(t => t.trim()))?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#dfecfd] text-[#0075ff] text-xs px-2.5 py-1 rounded-full font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* view detail page */}
                    <Link
                      to={`/projects/${project._id}`}
                      className="mt-auto inline-flex items-center gap-1.5 text-[#0075ff] hover:text-[#051229] text-sm font-bold transition-colors link-underline"
                    >
                      {t("projects.viewProject")} <FiExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* custom nav arrows */}
          <button className="projects-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white shadow-lg rounded-full p-2.5 text-[#364052] hover:bg-[#0075ff] hover:text-white transition-all cursor-pointer hover:scale-110">
            <FiChevronLeft size={22} />
          </button>
          <button className="projects-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white shadow-lg rounded-full p-2.5 text-[#364052] hover:bg-[#0075ff] hover:text-white transition-all cursor-pointer hover:scale-110">
            <FiChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Projects;
