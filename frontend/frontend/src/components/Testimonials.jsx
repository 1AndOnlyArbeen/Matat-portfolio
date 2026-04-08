import { useState, useEffect } from "react";
import { getTestimonials } from "../api";
import { testimonialsData as fallback } from "../data/placeholders";
import { FiStar } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

// client testimonials / reviews section
// shows client avatar, name, company, star rating and their review
function Testimonials() {
  const [testimonials, setTestimonials] = useState(fallback);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation(0.1);

  // load from backend
  useEffect(() => {
    getTestimonials().then((res) => {
      if (res && res.length > 0) setTestimonials(res);
    });
  }, []);

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div ref={headingRef} className={`text-center mb-12 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">What Our Clients Say</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Hear from the people who have worked with us.
          </p>
        </div>

        {/* testimonial cards */}
        <div ref={gridRef} className={`grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children ${gridVisible ? "visible" : ""}`}>
          {testimonials.map((item) => (
            <div
              key={item._id}
              className="bg-blue-50 rounded-xl p-6 relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* decorative quote mark */}
              <div className="text-blue-200 text-6xl font-serif absolute top-4 right-6 leading-none">
                &ldquo;
              </div>

              {/* client avatar + info at top */}
              <div className="flex items-center gap-3 mb-4">
                <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200" />
                <div>
                  <p className="text-blue-900 font-semibold text-sm">{item.name}</p>
                  <p className="text-gray-400 text-xs">{item.company}</p>
                </div>
              </div>

              {/* review text */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.text}</p>

              {/* star rating at bottom */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
