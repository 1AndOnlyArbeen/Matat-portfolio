import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getApps } from "../api";
import { appsData as fallback } from "../data/placeholders";
import { FiSmartphone, FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// displays mobile/web apps in a slider
function Apps() {
  const [apps, setApps] = useState(fallback);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [sliderRef, sliderVisible] = useScrollAnimation(0.1);

  // try loading from backend
  useEffect(() => {
    getApps().then((res) => {
      if (res && res.length > 0) setApps(res);
    });
  }, []);

  return (
    <section id="apps" className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div ref={headingRef} className={`text-center mb-12 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">Our Apps</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Mobile and web applications we have built and launched.
          </p>
        </div>

        {/* app slider */}
        <div ref={sliderRef} className={`relative animate-fade-up ${sliderVisible ? "visible" : ""}`}>
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{
              prevEl: ".apps-prev",
              nextEl: ".apps-next",
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={apps.length > 4}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
          >
            {apps.map((app) => (
              <SwiperSlide key={app._id}>
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 text-center group hover:-translate-y-1">
                  {/* app icon */}
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
                  </div>

                  <h3 className="text-lg font-semibold text-blue-900 mb-1">{app.name}</h3>

                  {/* platform badge */}
                  <div className="flex items-center justify-center gap-1 text-blue-500 text-xs mb-3">
                    <FiSmartphone size={12} />
                    <span>{app.platform}</span>
                  </div>

                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">{app.description}</p>

                  {/* link to detail page */}
                  <Link
                    to={`/apps/${app._id}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors group/link"
                  >
                    Learn More <FiArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* custom nav arrows */}
          <button className="apps-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white shadow-lg rounded-full p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
            <FiChevronLeft size={22} />
          </button>
          <button className="apps-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white shadow-lg rounded-full p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
            <FiChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Apps;
