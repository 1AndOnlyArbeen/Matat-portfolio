import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getTestimonials } from "../api";
import { FiStar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import useLang from "../hooks/useLang";

// animated heading — each letter from alternating directions
function AnimatedHeading({ text, visible }) {
  const directions = ["down", "up", "left", "right"];
  const getTransform = (dir) => {
    if (dir === "down") return "translateY(40px)";
    if (dir === "up") return "translateY(-40px)";
    if (dir === "left") return "translateX(-40px)";
    if (dir === "right") return "translateX(40px)";
    return "translateY(40px)";
  };
  let idx = 0;
  const words = text.split(" ");
  return (
    <span className="inline-flex flex-wrap">
      {words.map((word, wi) => (
        <span key={wi} className="inline-flex">
          {word.split("").map((char, ci) => {
            const dir = directions[idx % 4];
            const delay = idx * 60;
            idx++;
            return (
              <span
                key={`${wi}-${ci}`}
                className="inline-block transition-all duration-500 ease-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translate(0,0)" : getTransform(dir),
                  transitionDelay: `${delay}ms`,
                }}
              >{char}</span>
            );
          })}
          {wi < words.length - 1 && <span>&nbsp;</span>}
          {(() => { idx++; return null; })()}
        </span>
      ))}
    </span>
  );
}

const CARDS_PER_PAGE = 3;

function Testimonials() {
  const { t } = useTranslation();
  const l = useLang();
  const [testimonials, setTestimonials] = useState([]);
  const [openItem, setOpenItem] = useState(null);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState("right"); // slide direction
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [headingVisible, setHeadingVisible] = useState(false);
  const headingRef = useRef(null);
  const sectionRef = useRef(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  const animatingRef = useRef(animating);
  animatingRef.current = animating;

  useEffect(() => {
    getTestimonials().then((res) => {
      const list = res?.testimonial || (Array.isArray(res) ? res : []);
      if (list.length > 0) setTestimonials(list);
    });
  }, []);

  // heading replay on scroll
  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    let timer = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setHeadingVisible(true), 100);
        } else {
          clearTimeout(timer);
          setHeadingVisible(false);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => { clearTimeout(timer); io.disconnect(); };
  }, [testimonials]);

  // stagger mount animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMounted(true);
        else setMounted(false);
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [testimonials]);

  // auto-advance (must be before early return — hooks can't be conditional)
  const totalPages = Math.max(1, Math.ceil(testimonials.length / CARDS_PER_PAGE));
  useEffect(() => {
    if (totalPages <= 1 || testimonials.length === 0) return;
    const interval = setInterval(() => {
      if (animatingRef.current) return;
      const cur = pageRef.current;
      const next = cur === totalPages - 1 ? 0 : cur + 1;
      setDirection("right");
      setAnimating(true);
      setTimeout(() => {
        setPage(next);
        setTimeout(() => setAnimating(false), 50);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, [totalPages, testimonials.length]);

  if (testimonials.length === 0) return null;

  const currentCards = testimonials.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  const goTo = (newPage, dir) => {
    if (animating || newPage === page) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setPage(newPage);
      setTimeout(() => setAnimating(false), 50);
    }, 300);
  };

  const goPrev = () => {
    const prev = page === 0 ? totalPages - 1 : page - 1;
    goTo(prev, "left");
  };

  const goNext = () => {
    const next = page === totalPages - 1 ? 0 : page + 1;
    goTo(next, "right");
  };

  const slideTransform = animating
    ? direction === "right" ? "translateX(60px)" : "translateX(-60px)"
    : "translateX(0)";

  return (
    <section id="testimonials" ref={sectionRef} className="py-24 sm:py-28 bg-[#f0f2f5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* header: centered title + subtitle, arrows below */}
        <div ref={headingRef} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-[#051229] leading-tight flex flex-wrap justify-center">
            <AnimatedHeading text={t("testimonials.title")} visible={headingVisible} />
          </h2>
          <p className={`text-[#7e8590] text-base mt-2 max-w-md mx-auto transition-all duration-700 ease-out ${headingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "400ms" }}>
            {t("testimonials.subtitle")}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={goPrev}
              className="w-11 h-11 rounded-full border-2 border-[#d1d5db] flex items-center justify-center text-[#364052] hover:bg-[#2563eb] hover:border-[#2563eb] hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              className="w-11 h-11 rounded-full border-2 border-[#d1d5db] flex items-center justify-center text-[#364052] hover:bg-[#2563eb] hover:border-[#2563eb] hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* cards grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 transition-all duration-500 ease-out"
          style={{
            opacity: animating ? 0 : 1,
            transform: slideTransform,
          }}
        >
          {currentCards.map((item, i) => {
            const review = l(item, "reviewText") || item.text || "";
            const isLong = review.length > 180;

            return (
              <div
                key={item._id}
                className="relative bg-[#e8edf4] rounded-2xl p-7 sm:p-8 flex flex-col group hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)] transition-all duration-400"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(30px)",
                  transition: `opacity 0.6s ease ${i * 150}ms, transform 0.6s ease ${i * 150}ms, box-shadow 0.4s ease`,
                }}
              >
                {/* quote icon */}
                <div className="text-[#2563eb] text-5xl leading-none mb-4 select-none" style={{ fontFamily: "Georgia, serif" }}>
                  &#x275D;
                </div>

                {/* review text */}
                <p className="text-[#364052] text-sm leading-relaxed flex-1 line-clamp-5 mb-5">
                  {review}
                </p>

                {isLong && (
                  <button
                    onClick={() => setOpenItem(item)}
                    className="text-[#2563eb] text-xs font-bold self-start mb-4 cursor-pointer hover:text-[#1d4ed8] transition-colors"
                  >
                    {t("testimonials.seeMore")}
                  </button>
                )}

                {/* divider */}
                <div className="h-px bg-[#c9d1dc] mb-5" />

                {/* bottom: avatar, stars, name, dot */}
                <div className="flex items-center gap-4">
                  <img
                    src={item.avatar}
                    alt={l(item, "name")}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    {/* stars */}
                    <div className="flex items-center gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <FiStar
                          key={si}
                          size={14}
                          className={si < item.rating ? "text-[#2563eb] fill-[#2563eb]" : "text-[#c9d1dc]"}
                        />
                      ))}
                    </div>
                    <p className="text-[#051229] font-bold text-sm truncate">{l(item, "name")}</p>
                    <p className="text-[#7e8590] text-xs truncate">{l(item, "company")}</p>
                  </div>
                  {/* decorative dot */}
                  <div className="w-3 h-3 rounded-full bg-[#2563eb]/20 self-end shrink-0 group-hover:bg-[#2563eb]/50 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* pagination dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2.5 mt-10">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > page ? "right" : "left")}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === page
                    ? "w-8 h-3 bg-[#2563eb]"
                    : "w-3 h-3 bg-[#c9d1dc] hover:bg-[#2563eb]/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* full-review modal */}
      {openItem && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setOpenItem(null)}
        >
          <div
            className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-[#2563eb]" />

            <button
              onClick={() => setOpenItem(null)}
              className="absolute top-4 right-4 text-[#7e8590] hover:text-[#051229] hover:rotate-90 transition-all p-1 cursor-pointer z-10"
            >
              <FiX size={24} />
            </button>

            <div className="p-8 sm:p-10">
              <div className="text-[#2563eb]/15 text-7xl leading-none mb-4 select-none" style={{ fontFamily: "Georgia, serif" }}>&#x275D;</div>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={openItem.avatar}
                  alt={l(openItem, "name")}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#2563eb]/20 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[#051229] font-bold text-lg truncate">{l(openItem, "name")}</p>
                  <p className="text-[#7e8590] text-sm truncate">{l(openItem, "company")}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar key={i} size={14} className={i < openItem.rating ? "text-[#2563eb] fill-[#2563eb]" : "text-[#c9d1dc]"} />
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
