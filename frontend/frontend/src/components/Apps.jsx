import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getApps } from "../api";
import { FiSmartphone, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import useSectionHeading from "../hooks/useSectionHeading";
import useLang from "../hooks/useLang";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function Apps() {
  const { t } = useTranslation();
  const l = useLang();
  const heading = useSectionHeading("apps");
  const [apps, setApps] = useState([]);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [sliderRef, sliderVisible] = useScrollAnimation(0.1);

  useEffect(() => {
    getApps().then((res) => {
      const list = res?.apps || (Array.isArray(res) ? res : []);
      if (list.length > 0) setApps(list);
    });
  }, []);

  if (apps.length === 0) return null;

  const appCard = (app, index = 0) => (
    <div
      className="apps-card relative w-full max-w-[20rem] mx-auto h-full bg-white rounded-3xl p-7 sm:p-8 text-center group border border-gray-100/60 flex flex-col overflow-hidden"
      style={{
        boxShadow:
          "0 18px 50px rgba(15,35,65,0.10), 0 4px 14px rgba(15,35,65,0.06)",
        opacity: sliderVisible ? 1 : 0,
        transform: sliderVisible
          ? "translateY(0) scale(1)"
          : "translateY(40px) scale(0.94)",
        transition: `opacity 700ms cubic-bezier(0.22,1,0.36,1) ${index * 120}ms, transform 800ms cubic-bezier(0.22,1,0.36,1) ${index * 120}ms, box-shadow .55s ease`,
      }}
    >
      {/* hover gradient sheen */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,117,255,0.12), transparent 60%)" }}
      />

      {/* app icon — bigger, gentle idle float */}
      <div className="apps-icon w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-5 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-[-3deg] hover-shine bg-[#f3f4f6] flex items-center justify-center">
        <img
          src={app.appIcon || app.icon}
          alt={l(app, "appName") || app.name}
          className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-[#051229] mb-1 line-clamp-1 group-hover:text-[#0075ff] transition-colors duration-300">
        {l(app, "appName") || app.name}
      </h3>

      <div className="flex items-center justify-center gap-1.5 text-[#0075ff] text-xs sm:text-sm mb-4 font-semibold">
        <FiSmartphone size={14} />
        <span className="line-clamp-1">{l(app, "platform")}</span>
      </div>

      <p className="text-[#7e8590] text-sm sm:text-base leading-relaxed mb-5 line-clamp-3 flex-1">
        {l(app, "description")}
      </p>

      <Link
        to={`/apps/${app._id}`}
        className="inline-flex items-center justify-center gap-1.5 text-[#0075ff] hover:text-white bg-[#0075ff]/10 hover:bg-[#0075ff] text-sm font-bold transition-all duration-300 mt-auto px-5 py-2.5 rounded-full self-center"
      >
        {t("apps.learnMore")}
      </Link>
    </div>
  );

  return (
    <section id="apps" className="py-24 sm:py-28 bg-[#e1e8f0]/40 overflow-hidden">
      <style>{`
        .apps-card:hover {
          transform: translateY(-10px) scale(1.02) !important;
          box-shadow: 0 30px 60px rgba(0,117,255,0.18), 0 10px 24px rgba(15,35,65,0.10) !important;
        }
        @keyframes appsIdleFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        .apps-icon { animation: appsIdleFloat 4.5s ease-in-out infinite; }

        /* shimmer / accent ring that pulses while idle */
        @keyframes appsRingPulse {
          0%, 100% { opacity: 0.0; transform: scale(0.95); }
          50%      { opacity: 0.5; transform: scale(1.05); }
        }
        .apps-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 1.5rem;
          background: linear-gradient(135deg, rgba(0,117,255,0.0) 0%, rgba(0,117,255,0.18) 50%, rgba(0,117,255,0.0) 100%);
          z-index: -1;
          opacity: 0;
          transition: opacity .5s ease;
        }
        .apps-card:hover::before { opacity: 1; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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

        <div ref={sliderRef} className={`animate-fade-up ${sliderVisible ? "visible" : ""}`}>
          {/* Swiper — one card per slide on mobile, multiple on bigger screens */}
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{ prevEl: ".apps-prev", nextEl: ".apps-next" }}
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              loop={apps.length > 4}
              breakpoints={{
                640:  { slidesPerView: 2, spaceBetween: 14 },
                1024: { slidesPerView: 3, spaceBetween: 14 },
                1280: { slidesPerView: 4, spaceBetween: 14 },
              }}
              // padding around the swiper so the card's hover lift + scale isn't clipped
              className="!px-2 !py-6"
            >
              {apps.map((app, idx) => (
                <SwiperSlide key={app._id} className="!h-auto">
                  {appCard(app, idx)}
                </SwiperSlide>
              ))}
            </Swiper>

            {apps.length > 1 && (
              <div className="flex sm:hidden justify-center gap-3 mt-5">
                <button
                  className="apps-prev w-10 h-10 rounded-full border border-[#d1d5db] flex items-center justify-center hover:bg-[#0075ff]/5 transition-all cursor-pointer"
                  aria-label="Previous"
                >
                  <FiChevronLeft size={18} className="text-[#0075ff]" />
                </button>
                <button
                  className="apps-next w-10 h-10 rounded-full bg-[#0075ff] flex items-center justify-center hover:bg-[#0075ff]/90 transition-all shadow-lg shadow-[#0075ff]/20 cursor-pointer"
                  aria-label="Next"
                >
                  <FiChevronRight size={18} className="text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Apps;
