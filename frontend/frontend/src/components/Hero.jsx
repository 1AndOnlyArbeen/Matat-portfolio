import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";
import { getHero } from "../api";
import useLang from "../hooks/useLang";

function Hero() {
  const { t } = useTranslation();
  const l = useLang();
  const [data, setData] = useState(null);

  useEffect(() => {
    getHero().then((res) => {
      if (res && res.title) setData(res);
    });
  }, []);

  if (!data) return null;

  return (
    <>
      {/* Spacer for fixed navbar */}
      <div className="h-20 bg-white" />

      <section id="hero" className="relative bg-white overflow-hidden h-[calc(100vh-80px)] flex items-center">
        {/* floating decorative blobs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-[#2563eb]/5 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-10 -right-16 w-64 h-64 bg-[#2563eb]/4 rounded-full blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#2563eb]/3 animate-morph pointer-events-none" />

        {/* floating geometric shapes */}
        <div className="absolute top-32 right-[15%] w-3 h-3 bg-[#2563eb] rounded-full animate-float opacity-20" />
        <div className="absolute top-48 left-[10%] w-2 h-2 bg-[#2563eb] rounded-full animate-float opacity-15" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-24 left-[20%] w-4 h-4 border-2 border-[#2563eb]/20 rounded-full animate-float-slow opacity-30" />
        <div className="absolute top-40 right-[30%] w-6 h-6 border-2 border-[#2563eb]/10 rotate-45 animate-float-slow opacity-20" style={{ animationDelay: "3s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 md:pt-16 pb-6 sm:pb-8 md:pb-10 w-full">
          <div className="flex flex-col md:flex-row items-center gap-5 md:gap-10">

            {/* LEFT -- text + button */}
            <div className="w-full md:flex-1 order-1 md:order-1 text-center md:text-left">
              <h1 className="hero-title font-black text-[#051229] mb-3 sm:mb-4 leading-[1.1] tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                {l(data, "title")}
              </h1>

              <p className="hero-subtitle text-sm sm:text-base md:text-lg text-[#7e8590] mb-5 sm:mb-6 leading-relaxed max-w-xl mx-auto md:mx-0">
                {l(data, "subtitle")}
              </p>

              {(data.badgeImage1 || data.badgeImage2) && (
                <div className="hero-subtitle flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 mb-5 sm:mb-6">
                  {data.badgeImage1 && (
                    <img src={data.badgeImage1} alt={t("hero.badge1")} className="h-8 sm:h-10 object-contain border-0 outline-none shadow-none" />
                  )}
                  {data.badgeImage2 && (
                    <img src={data.badgeImage2} alt={t("hero.badge2")} className="h-8 sm:h-10 object-contain border-0 outline-none shadow-none" />
                  )}
                </div>
              )}

              <a
                href={data.buttonLink}
                className="hero-button btn-solvior inline-flex"
              >
                <span className="btn-icon">
                  <FiArrowRight size={20} />
                </span>
                <span className="btn-text">{l(data, "buttonText")}</span>
              </a>
            </div>

            {/* RIGHT -- banner image */}
            <div className="hero-image w-2/3 sm:w-1/2 md:w-[28rem] lg:w-[32rem] shrink-0 order-2 md:order-2 mx-auto md:mx-0">
              <img
                src={data.backgroundImage}
                alt={data.title}
                draggable="false"
                className="block w-full h-auto object-cover select-none rounded-3xl"
              />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
