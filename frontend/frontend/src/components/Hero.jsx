import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getHero } from "../api";
import useLang from "../hooks/useLang";

function Hero() {
  const { t } = useTranslation();
  const l = useLang();
  const [data, setData] = useState(null);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    getHero().then((res) => {
      if (res && res.title) setData(res);
    });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [data]);

  if (!data) return null;

  const fromAbove = (delay) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(-50px)",
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
  });

  return (
    <>
      {/* Spacer for fixed navbar + breathing gap before the banner starts (small on desktop) */}
      <div className="h-14 bg-white" />
      <div className="h-8 sm:h-10 md:h-0 lg:h-0 bg-white" />

      <section ref={sectionRef} id="hero" className="relative bg-white overflow-hidden min-h-[calc(100vh-56px)] md:min-h-0 flex items-start">
        {/* 2 animated bubbles — light left, darker right */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-[#dbeafe]/60 rounded-full blur-[80px] animate-pulse-glow pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-[#bfdbfe]/70 rounded-full blur-[80px] pointer-events-none" style={{ animation: "pulse-glow 5s ease-in-out infinite 1.5s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-0 lg:pt-0 pb-6 sm:pb-8 md:pb-10 w-full">
          <div className="flex flex-col md:flex-row items-center gap-5 md:gap-10">

            {/* LEFT -- text + button (shifted left on desktop) */}
            <div className="w-full md:flex-1 order-1 md:order-1 text-center md:text-left md:-ml-4 lg:-ml-10">
              <h1
                className="relative top-4 sm:top-6 md:-top-16 font-black text-black/80 mb-3 sm:mb-4 leading-[1.1] tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                style={fromAbove(0)}
              >
                {l(data, "title")}
              </h1>

              <p
                className="text-sm sm:text-base md:text-lg text-[#7e8590] mb-5 sm:mb-6 leading-relaxed max-w-xl mx-auto md:mx-0"
                style={fromAbove(0.15)}
              >
                {l(data, "subtitle")}
              </p>

              {(data.badgeImage1 || data.badgeImage2) && (
                <div
                  className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 mb-10 sm:mb-12"
                  style={fromAbove(0.3)}
                >
                  {data.badgeImage1 && (
                    <img src={data.badgeImage1} alt={t("hero.badge1")} className="h-12 sm:h-14 object-contain border-0 outline-none shadow-none" />
                  )}
                  {data.badgeImage2 && (
                    <img src={data.badgeImage2} alt={t("hero.badge2")} className="h-12 sm:h-14 object-contain border-0 outline-none shadow-none" />
                  )}
                </div>
              )}

              <a
                href={data.buttonLink}
                className="hero-button btn-solvior inline-flex"
                style={fromAbove(0.45)}
              >
                <span className="btn-text">{l(data, "buttonText")}</span>
              </a>
            </div>

            {/* RIGHT -- banner image (bigger and pushed down on mobile, shifted a bit left on desktop) */}
            <div className="hero-image w-full sm:w-2/3 md:w-[36rem] lg:w-[44rem] shrink-0 order-2 md:order-2 mx-auto md:mx-0 mt-6 sm:mt-4 md:mt-0 md:-ml-8 md:-mr-12 lg:-ml-16 lg:-mr-24">
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
