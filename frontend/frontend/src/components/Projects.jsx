import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../api";
import { projectsData as fallback } from "../data/placeholders";
import { FiExternalLink } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

// shows all portfolio projects in a card grid
// fetches from api, uses placeholder data if backend is not connected
function Projects() {
  const [projects, setProjects] = useState(fallback);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation(0.1);

  // try loading projects from backend
  useEffect(() => {
    getProjects().then((res) => {
      if (res && res.length > 0) setProjects(res);
    });
  }, []);

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading - animates on scroll */}
        <div ref={headingRef} className={`text-center mb-12 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">Our Projects</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Take a look at some of the projects we have delivered for our clients.
          </p>
        </div>

        {/* project cards - stagger animation on scroll */}
        <div ref={gridRef} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children ${gridVisible ? "visible" : ""}`}>
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
