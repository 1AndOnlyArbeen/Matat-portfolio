import { useState, useEffect } from "react";
import { getTestimonials } from "../api";
import { testimonialsData as fallback } from "../data/placeholders";
import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// client testimonials slider
function Testimonials() {
  const [testimonials, setTestimonials] = useState(fallback);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [sliderRef, sliderVisible] = useScrollAnimation(0.1);

  useEffect(() => {
    getTestimonials().then((res) => {
      const list = res?.testimonial || (Array.isArray(res) ? res : []);
      if (list.length > 0) setTestimonials(list);
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

        {/* testimonials slider */}
        <div ref={sliderRef} className={`relative animate-fade-up ${sliderVisible ? "visible" : ""}`}>
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: ".testimonials-prev",
              nextEl: ".testimonials-next",
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            centeredSlides={true}
            loop={testimonials.length > 3}
            breakpoints={{
              480: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
            }}
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item._id}>
                <div className="bg-blue-50 rounded-xl p-6 relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-64 flex flex-col">
                  {/* decorative quote mark */}
                  <div className="text-blue-200 text-6xl font-serif absolute top-4 right-6 leading-none">
                    &ldquo;
                  </div>

                  {/* client avatar + info */}
                  <div className="flex items-center gap-3 mb-4">
                    <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200" />
                    <div>
                      <p className="text-blue-900 font-semibold text-sm">{item.name}</p>
                      <p className="text-gray-400 text-xs">{item.company}</p>
                    </div>
                  </div>

                  {/* review text */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-4">{item.reviewText || item.text}</p>

                  {/* star rating */}
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
              </SwiperSlide>
            ))}
          </Swiper>

          {/* custom nav arrows */}
          <button className="testimonials-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white shadow-lg rounded-full p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
            <FiChevronLeft size={22} />
          </button>
          <button className="testimonials-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white shadow-lg rounded-full p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
            <FiChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
