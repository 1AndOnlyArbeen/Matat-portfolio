import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";
import { getAbout } from "../api";
import useLang from "../hooks/useLang";
import useScrollAnimation from "../hooks/useScrollAnimation";
import useSectionHeading from "../hooks/useSectionHeading";

function parseStatValue(raw) {
  const str = String(raw || "0").trim();
  const match = str.match(/^([\d,.]+)(.*)/);
  if (!match) return { num: 0, suffix: str };
  const num = parseFloat(match[1].replace(/,/g, ""));
  return { num: isNaN(num) ? 0 : num, suffix: match[2] || "" };
}

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

function StatCard({ rawValue, label, index, triggered }) {
  const { num, suffix } = parseStatValue(rawValue);
  const [display, setDisplay] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!triggered) {
      setDisplay(0);
      setProgress(0);
      return;
    }
    const duration = 1600;
    const delay = index * 120;
    let start = null;
    const timeout = setTimeout(() => {
      const tick = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = easeOutQuart(p);
        setDisplay(Math.round(eased * num));
        setProgress(eased);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [triggered, num, index]);

  return (
    <div
      className="relative bg-white rounded-[1.5rem] p-6 border border-white/60 group hover:-translate-y-1 transition-all duration-500"
      style={{
        boxShadow:
          "inset 0 0 0 1px rgba(187,201,204,0.3), 0 20px 40px rgba(26,28,26,0.04), 0 8px 16px rgba(26,28,26,0.02)",
        opacity: triggered ? 1 : 0,
        transform: triggered ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ease ${index * 120}ms, transform 0.6s ease ${index * 120}ms, box-shadow 0.4s ease`,
      }}
    >
      <p className="text-4xl sm:text-5xl font-extrabold text-[#051229] tabular-nums leading-none tracking-tight">
        {display}
        <span className="text-[#0075ff]">{suffix}</span>
      </p>

      <div className="mt-3 h-[3px] w-full rounded-full bg-[#051229]/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#0075ff]"
          style={{
            width: `${progress * 100}%`,
            boxShadow: "0 0 10px rgba(0,117,255,0.5)",
            transition: "width 50ms linear",
          }}
        />
      </div>

      <p className="mt-3 text-[#364052] text-[12px] sm:text-[13px] uppercase tracking-[0.16em] font-bold leading-snug">
        {label}
      </p>
    </div>
  );
}

function About() {
  const { t } = useTranslation();
  const l = useLang();
  const heading = useSectionHeading("about");
  const [about, setAbout] = useState(null);
  const [statsTriggered, setStatsTriggered] = useState(false);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [bodyRef, bodyVisible] = useScrollAnimation(0.15);
  const statsRef = useRef(null);

  useEffect(() => {
    getAbout().then((res) => {
      if (res) setAbout(res);
    });
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setStatsTriggered(entry.isIntersecting),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [about]);

  if (!about) return null;

  const stats = (about.stats || []).slice(0, 4);
  // ticker is whatever admin saved — no hardcoded list
  const tickerItems = (about.tickerItems || [])
    .map((tk) => l(tk, "text"))
    .filter(Boolean);

  // every piece of copy comes from the database; an empty value just hides that piece
  const headingLine1 = heading.titlePlain || l(about, "headingLine1");
  const headingLine2 = heading.titleHighlight || l(about, "headingLine2");
  const eyebrowLabel = heading.label;
  const subtitleText = heading.subtitle || l(about, "mission");
  const ctaLabel = l(about, "ctaLabel");

  return (
    <section
      id="about"
      className="relative py-24 sm:py-28 bg-[#f0f2f5] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* HEADER — every piece is admin-driven; missing values hide their slot */}
        <div
          ref={headingRef}
          className={`text-center mb-14 animate-fade-up ${headingVisible ? "visible" : ""}`}
        >
          {eyebrowLabel && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0075ff]/5 border border-[#0075ff]/10 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0075ff] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0075ff]" />
              </span>
              <span className="text-xs font-bold tracking-widest text-[#0075ff] uppercase">
                {eyebrowLabel}
              </span>
            </div>
          )}
          {(headingLine1 || headingLine2) && (
            <h2 className="section-title">
              {headingLine1}
              {headingLine1 && headingLine2 && " "}
              {headingLine2 && (
                <span className="text-[#0075ff]">{headingLine2}</span>
              )}
            </h2>
          )}
          {subtitleText && (
            <p className="text-[#7e8590] text-base max-w-xl mx-auto">
              {subtitleText}
            </p>
          )}
        </div>

        {/* CONTENT — narrative on the left, stats grid on the right */}
        <div
          ref={bodyRef}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start animate-fade-up ${bodyVisible ? "visible" : ""}`}
        >
          {/* LEFT — narrative */}
          <div className="lg:col-span-7">
            {l(about, "title") && (
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0075ff] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0075ff]" />
                </span>
                <span className="text-[#0075ff] text-sm font-bold tracking-wide">
                  {l(about, "title")}
                </span>
              </div>
            )}

            {l(about, "description") && (
              <p className="text-[#364052] leading-relaxed text-base sm:text-lg mb-6">
                {l(about, "description")}
              </p>
            )}

            {ctaLabel && (
              <button
                type="button"
                className="btn-solvior btn-pulse"
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <span className="btn-text">{ctaLabel}</span>
                <span className="btn-icon">
                  <FiArrowRight size={18} />
                </span>
              </button>
            )}
          </div>

          {/* RIGHT — stats grid (rendered only when admin has saved any stats) */}
          {stats.length > 0 && (
            <div className="lg:col-span-5">
              <div ref={statsRef} className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <StatCard
                    key={i}
                    rawValue={l(stat, "value")}
                    label={l(stat, "label")}
                    index={i}
                    triggered={statsTriggered}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TICKER — same logo-marquee rhythm used in Clients */}
        {tickerItems.length > 0 && (
          <div className="relative mt-16 overflow-hidden logo-marquee-wrap">
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#f0f2f5] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#f0f2f5] to-transparent z-10 pointer-events-none" />
            <div className="flex gap-10 sm:gap-14 logo-marquee-track py-4">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <div
                  key={i}
                  className="shrink-0 inline-flex items-center gap-3 text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#7e8590] font-semibold"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0075ff]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default About;
