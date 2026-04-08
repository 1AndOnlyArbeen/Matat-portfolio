import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../api";
import { projectsData as fallback } from "../data/placeholders";
import { FiExternalLink, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// shows all portfolio projects in a slider
function Projects() {
  const [projects, setProjects] = useState(fallback);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [sliderRef, sliderVisible] = useScrollAnimation(0.1);

  // try loading projects from backend
  useEffect(() => {
    getProjects().then((res) => {
      if (res && res.length > 0) setProjects(res);
    });
  }, []);

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div ref={headingRef} className={`text-center mb-12 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">Our Projects</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Take a look at some of the projects we have delivered for our clients.
          </p>
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
              <SwiperSlide key={project._id}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1">
                  {/* project thumbnail */}
                  <div className="overflow-hidden h-48">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* project info */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">{project.title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{project.description}</p>

                    {/* tech tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* view detail page */}
                    <Link
                      to={`/projects/${project._id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      View Project <FiExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* custom nav arrows */}
          <button className="projects-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white shadow-lg rounded-full p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
            <FiChevronLeft size={22} />
          </button>
          <button className="projects-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white shadow-lg rounded-full p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
            <FiChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Projects;
