import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getTestimonials } from "../api";
import { FiStar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import useLang from "../hooks/useLang";
import useSectionHeading from "../hooks/useSectionHeading";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function Testimonials() {
  const { t } = useTranslation();
  const l = useLang();
  const heading = useSectionHeading("testimonials");
  const [testimonials, setTestimonials] = useState([]);
  const [openItem, setOpenItem] = useState(null);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    getTestimonials().then((res) => {
      const list = res?.testimonial || (Array.isArray(res) ? res : []);
      if (list.length > 0) setTestimonials(list);
    });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setMounted(true); else setMounted(false); },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [testimonials]);

  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative py-24 sm:py-28 bg-[#f0f2f5] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* header — centered */}
        <div
          className="text-center mb-12"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}
        >
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
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#051229] mb-2">
              {heading.titlePlain}
              {heading.titlePlain && heading.titleHighlight && " "}
              {heading.titleHighlight && (
                <span className="text-[#0075ff]">{heading.titleHighlight}</span>
              )}
            </h2>
          )}
          {heading.subtitle && (
            <p className="text-[#7e8590] text-base max-w-md mx-auto mb-6">{heading.subtitle}</p>
          )}
          <div className="flex justify-center gap-2">
            <button
              className="testimonials-prev w-10 h-10 rounded-full border border-[#d1d5db] flex items-center justify-center hover:bg-[#0075ff]/5 transition-all cursor-pointer"
              aria-label="Previous"
            >
              <FiChevronLeft size={18} className="text-[#0075ff]" />
            </button>
            <button
              className="testimonials-next w-10 h-10 rounded-full bg-[#0075ff] flex items-center justify-center hover:bg-[#0075ff]/90 transition-all shadow-lg shadow-[#0075ff]/20 cursor-pointer"
              aria-label="Next"
            >
              <FiChevronRight size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Swiper — one card per slide on mobile, 3 on md+ */}
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{ prevEl: ".testimonials-prev", nextEl: ".testimonials-next" }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop={testimonials.length > 3}
          breakpoints={{
            640:  { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="pb-2"
        >
          {testimonials.map((item) => {
            const review = l(item, "reviewText") || item.text || "";

            return (
              <SwiperSlide key={item._id} className="!h-auto">
                <div
                  className="relative h-full bg-white rounded-[1.75rem] p-7 sm:p-8 flex flex-col border border-white/60 group hover:-translate-y-1.5 transition-transform duration-500"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(187,201,204,0.3), 0 20px 40px rgba(26,28,26,0.04), 0 8px 16px rgba(26,28,26,0.02)",
                  }}
                >
                {/* quote watermark */}
                <span className="absolute top-4 right-6 text-[#0075ff]/5 text-6xl select-none pointer-events-none" style={{ fontFamily: "Georgia, serif" }}>&#x275D;</span>

                {/* avatar + info */}
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="relative">
                    {item.avatar ? (
                      <img src={item.avatar} alt={l(item, "name")} className="w-12 h-12 rounded-full object-cover ring-4 ring-[#0075ff]/10" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#e9e8e5] ring-4 ring-[#0075ff]/10" />
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 bg-[#0075ff] text-white p-0.5 rounded-full border-2 border-white">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#051229] text-sm truncate">{l(item, "name")}</p>
                    <p className="text-[11px] text-[#7e8590] truncate">{l(item, "company")}</p>
                  </div>
                </div>

                {/* stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <FiStar
                      key={si}
                      size={14}
                      style={si < item.rating ? { fill: "#0075ff", color: "#0075ff" } : { color: "#d1d5db" }}
                    />
                  ))}
                </div>

                {/* review text */}
                <p className="text-[#364052] text-sm sm:text-base leading-relaxed italic line-clamp-4 mb-4 h-[5.5rem]">
                  &ldquo;{review}&rdquo;
                </p>

                <button onClick={() => setOpenItem(item)} className="text-[#0075ff] text-xs font-bold cursor-pointer hover:underline self-start mb-3 mt-auto">
                  {t("testimonials.seeMore")}
                </button>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* full-review modal */}
      {openItem && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setOpenItem(null)}
        >
          <div
            className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#0075ff] to-[#2563eb]" />

            <button
              onClick={() => setOpenItem(null)}
              className="absolute top-4 right-4 text-[#7e8590] hover:text-[#051229] hover:rotate-90 transition-all p-1 cursor-pointer z-10"
            >
              <FiX size={24} />
            </button>

            <div className="p-8 sm:p-10">
              <div className="text-[#0075ff]/8 text-7xl leading-none mb-4 select-none" style={{ fontFamily: "Georgia, serif" }}>&#x275D;</div>

              <div className="flex items-center gap-4 mb-6">
                {openItem.avatar && (
                  <img src={openItem.avatar} alt={l(openItem, "name")} className="w-14 h-14 rounded-full object-cover ring-4 ring-[#0075ff]/10 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[#051229] font-bold text-lg truncate">{l(openItem, "name")}</p>
                  <p className="text-[#0075ff] text-sm truncate">{l(openItem, "company")}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar key={i} size={14} style={i < openItem.rating ? { fill: "#0075ff", color: "#0075ff" } : { color: "#d1d5db" }} />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[#364052] text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                {l(openItem, "reviewText") || openItem.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Testimonials;
