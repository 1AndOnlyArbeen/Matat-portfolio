import { useState, useEffect } from "react";
import { getTestimonials } from "../api";
import { FiStar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// threshold — any review longer than this shows the "See more" link
const CLAMP_CHARS = 160;

// client testimonials slider — fully dynamic from backend
function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [openItem, setOpenItem] = useState(null); // full-review modal
  const [headingRef, headingVisible] = useScrollAnimation();
  const [sliderRef, sliderVisible] = useScrollAnimation(0.1);

  useEffect(() => {
    getTestimonials().then((res) => {
      const list = res?.testimonial || (Array.isArray(res) ? res : []);
      if (list.length > 0) setTestimonials(list);
    });
  }, []);

  // hide section if no testimonials returned
  if (testimonials.length === 0) return null;

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
            {testimonials.map((item) => {
              const review = item.reviewText || item.text || "";
              const isLong = review.length > CLAMP_CHARS;
              return (
                <SwiperSlide key={item._id}>
                  <div className="bg-blue-50 rounded-xl p-6 relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-72 flex flex-col overflow-hidden">
                    {/* client avatar + info */}
                    <div className="flex items-center gap-3 mb-4 shrink-0">
                      <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-blue-900 font-semibold text-sm truncate">{item.name}</p>
                        <p className="text-gray-400 text-xs truncate">{item.company}</p>
                      </div>
                    </div>

                    {/* review text — clamped to 4 lines, overflow hidden */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-2 flex-1 line-clamp-4 overflow-hidden">
                      {review}
                    </p>

                    {/* See more — only shows for long reviews */}
                    {isLong && (
                      <button
                        onClick={() => setOpenItem(item)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold self-start mb-3 cursor-pointer transition-colors"
                      >
                        See more →
                      </button>
                    )}

                    {/* star rating — always at the bottom */}
                    <div className="flex items-center gap-1 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar
                          key={i}
                          size={16}
                          className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                        />
                      ))}
                      {item.rating > 0 && (
                        <span className="ml-1.5 text-xs font-semibold text-gray-600">{item.rating}/5</span>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
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

      {/* full-review modal */}
      {openItem && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setOpenItem(null)}
        >
          <div
            className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* close button */}
            <button
              onClick={() => setOpenItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:rotate-90 transition-all p-1 cursor-pointer z-10"
            >
              <FiX size={24} />
            </button>

            <div className="p-8 sm:p-10">
              {/* decorative quote */}
              <div className="text-blue-200 text-8xl font-serif leading-none mb-2 pointer-events-none">&ldquo;</div>

              {/* client info */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={openItem.avatar}
                  alt={openItem.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-blue-900 font-bold text-lg truncate">{openItem.name}</p>
                  <p className="text-gray-500 text-sm truncate">{openItem.company}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        size={14}
                        className={i < openItem.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                      />
                    ))}
                    {openItem.rating > 0 && (
                      <span className="ml-1.5 text-xs font-semibold text-gray-500">{openItem.rating}/5</span>
                    )}
                  </div>
                </div>
              </div>

              {/* full review text */}
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                {openItem.reviewText || openItem.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Testimonials;
