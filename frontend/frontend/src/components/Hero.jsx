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
      <div className="h-14 bg-white" />

      <section id="hero" className="relative bg-white overflow-hidden h-[calc(100vh-56px)] flex items-start">
        {/* 2 animated bubbles — light left, darker right */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-[#dbeafe]/60 rounded-full blur-[80px] animate-pulse-glow pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-[#bfdbfe]/70 rounded-full blur-[80px] pointer-events-none" style={{ animation: "pulse-glow 5s ease-in-out infinite 1.5s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6 sm:pb-8 md:pb-10 w-full">
          <div className="flex flex-col md:flex-row items-center gap-5 md:gap-10">

            {/* LEFT -- text + button */}
            <div className="w-full md:flex-1 order-1 md:order-1 text-center md:text-left">
              <h1 className="hero-title font-black text-black/80 mb-3 sm:mb-4 leading-[1.1] tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
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
            <div className="hero-image w-3/4 sm:w-2/3 md:w-[36rem] lg:w-[44rem] shrink-0 order-2 md:order-2 mx-auto md:mx-0 md:-mr-28 lg:-mr-44">
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
