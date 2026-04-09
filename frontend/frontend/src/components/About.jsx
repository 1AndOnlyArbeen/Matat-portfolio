import { useState, useEffect } from "react";
import { getAbout } from "../api";
import { aboutData as fallback } from "../data/placeholders";
import useScrollAnimation from "../hooks/useScrollAnimation";

// about us section with company description and stats
// stats are displayed in a 2x2 grid on the right
function About() {
  const [about, setAbout] = useState(fallback);
  const [textRef, textVisible] = useScrollAnimation();
  const [statsRef, statsVisible] = useScrollAnimation(0.2);

  useEffect(() => {
    getAbout().then((res) => {
      if (res) setAbout(res);
    });
  }, []);

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div className="text-center mb-12 animate-fade-up visible">
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">{about.title}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{about.mission}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* left side - text content, slides in from left */}
          <div ref={textRef} className={`animate-fade-left ${textVisible ? "visible" : ""}`}>
            <p className="text-gray-600 leading-relaxed mb-6">{about.description}</p>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
            >
              Get In Touch
            </button>
          </div>

          {/* right side - stats cards with stagger animation */}
          <div ref={statsRef} className={`grid grid-cols-2 gap-6 stagger-children ${statsVisible ? "visible" : ""}`}>
            {about.stats?.map((stat, index) => (
              <div
                key={index}
                className="bg-blue-50 rounded-xl p-6 text-center hover:bg-blue-100 transition-colors duration-300 hover:scale-105 cursor-default"
              >
                <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
