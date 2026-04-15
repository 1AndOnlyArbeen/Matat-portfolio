import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { getAbout } from "../api";
import useScrollAnimation from "../hooks/useScrollAnimation";
import useLang from "../hooks/useLang";

function parseStatValue(raw) {
  const str = String(raw || "0").trim();
  const match = str.match(/^([\d,.]+)(.*)/);
  if (!match) return { num: 0, suffix: str };
  const num = parseFloat(match[1].replace(/,/g, ""));
  return { num: isNaN(num) ? 0 : num, suffix: match[2] || "" };
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 4);
}

function AnimatedStat({ rawValue, label, index, triggered }) {
  const { num, suffix } = parseStatValue(rawValue);
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const rafRef = useRef(null);

  const fromTop = index % 2 === 1;
  const delay = index * 150;

  useEffect(() => {
    if (!triggered) {
      setDisplay(0);
      setDone(false);
      return;
    }

    const duration = 2000;
    let start = null;

    const timeout = setTimeout(() => {
      const tick = (ts) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(easeOut(progress) * num);
        setDisplay(current);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDone(true);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [triggered, num, delay]);

  // accent colors per card
  const accents = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24"];
  const accent = accents[index % 4];

  return (
    <div
      className="transition-all duration-700 ease-out"
      style={{
        opacity: triggered ? 1 : 0,
        transform: triggered
          ? "translateY(0)"
          : `translateY(${fromTop ? "-40px" : "40px"})`,
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/[0.08] hover:bg-white/[0.12] transition-colors relative overflow-hidden group">
        {/* accent glow line at top */}
        <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-60" style={{ background: accent }} />
        <p className="text-3xl sm:text-4xl font-black text-white leading-none mb-1">
          {display}<span style={{ color: accent }}>{done ? suffix : ""}</span>
        </p>
        <p className="text-white/50 text-[11px] sm:text-xs font-semibold leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}

function About() {
  const { t } = useTranslation();
  const l = useLang();
  const [about, setAbout] = useState(null);
  const [leftRef, leftVisible] = useScrollAnimation();
  const [statsTriggered, setStatsTriggered] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const statsRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    getAbout().then((res) => {
      if (res) setAbout(res);
    });
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    let delayTimer = null;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          delayTimer = setTimeout(() => setStatsTriggered(true), 200);
        } else {
          clearTimeout(delayTimer);
          setStatsTriggered(false);
        }
      },
      { threshold: 0.3 }
    );

    io.observe(el);
    return () => {
      clearTimeout(delayTimer);
      io.disconnect();
    };
  }, [about]);

  // right-side text — reset on leave, replay on enter
  useEffect(() => {
    const el = rightRef.current;
    if (!el) return;

    let delayTimer = null;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          delayTimer = setTimeout(() => setTextVisible(true), 100);
        } else {
          clearTimeout(delayTimer);
          setTextVisible(false);
        }
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => {
      clearTimeout(delayTimer);
      io.disconnect();
    };
  }, [about]);

  if (!about) return null;

  const stats = about.stats || [];
  const features = [
    t("about.feature1", { defaultValue: "" }),
    t("about.feature2", { defaultValue: "" }),
    t("about.feature3", { defaultValue: "" }),
  ].filter(Boolean);

  return (
    <section id="about" className="relative py-24 sm:py-28 bg-[#dfe6f0] overflow-hidden">
      {/* decorative floating dots */}
      <div className="absolute top-16 left-[8%] w-2 h-2 bg-[#2563eb]/30 rounded-full animate-float pointer-events-none" />
      <div className="absolute top-28 right-[12%] w-3 h-3 bg-[#2563eb]/20 rounded-full animate-float pointer-events-none" style={{ animationDelay: "1.5s" }} />
      <div className="absolute bottom-20 left-[15%] w-2.5 h-2.5 bg-[#2563eb]/25 rounded-full animate-float-slow pointer-events-none" style={{ animationDelay: "0.8s" }} />
      <div className="absolute top-1/2 left-[5%] w-1.5 h-1.5 bg-[#2563eb]/20 rounded-full animate-float pointer-events-none" style={{ animationDelay: "2.5s" }} />
      {/* decorative stars */}
      <div className="absolute top-40 right-[25%] text-[#2563eb]/15 pointer-events-none animate-float-slow" style={{ animationDelay: "2s" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
      </div>
      <div className="absolute bottom-32 right-[10%] text-[#2563eb]/10 pointer-events-none animate-float" style={{ animationDelay: "1s" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ===== LEFT SIDE — dark card with stats grid ===== */}
          <div ref={leftRef} className={`animate-fade-right ${leftVisible ? "visible" : ""}`}>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2341] to-[#162d50] p-7 sm:p-9 shadow-[0_30px_80px_rgba(10,22,40,0.5)]">

              {/* diagonal stripe texture */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,1) 10px, rgba(255,255,255,1) 11px)",
                }}
              />

              {/* corner glow accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563eb]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#7c3aed]/10 rounded-full blur-2xl pointer-events-none" />

              {/* 2x2 stats grid */}
              <div ref={statsRef} className="relative grid grid-cols-2 gap-4 sm:gap-5">
                {stats.slice(0, 4).map((stat, i) => (
                  <AnimatedStat
                    key={i}
                    rawValue={l(stat, "value")}
                    label={l(stat, "label")}
                    index={i}
                    triggered={statsTriggered}
                  />
                ))}
              </div>

              {/* bottom decorative bar */}
              <div className="relative mt-7 pt-6 border-t border-white/[0.06] flex items-center gap-3">
                <div className="flex gap-1.5">
                  {["#60a5fa", "#a78bfa", "#34d399", "#fbbf24"].map((c, i) => (
                    <div key={i} className="w-2 h-2 rounded-full" style={{ background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
              </div>
            </div>

            {/* floating badge — top right */}
            <div className="absolute -top-4 right-4 lg:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] shadow-lg animate-float-slow flex items-center justify-center rotate-12" style={{ animationDelay: "1s" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
          </div>

          {/* ===== RIGHT SIDE — text content (staggered entrance) ===== */}
          <div ref={rightRef} className={`stagger-children ${textVisible ? "visible" : ""}`}>

            <h2 className="text-3xl sm:text-4xl font-black text-[#051229] mb-2 leading-tight flex flex-wrap">
              {(() => {
                const text = t("about.title");
                // A=down, b=down, o=up, u=left, t=up, (space), U=left, s=right
                const directions = { 0: "down", 1: "down", 2: "up", 3: "left", 4: "up" };
                // after space: U=left, s=right
                const directions2 = { 0: "left", 1: "right" };
                const words = text.split(" ");
                const getTransform = (dir) => {
                  if (dir === "down") return "translateY(40px)";
                  if (dir === "up") return "translateY(-40px)";
                  if (dir === "left") return "translateX(-40px)";
                  if (dir === "right") return "translateX(40px)";
                  return "translateY(40px)";
                };
                let globalIdx = 0;
                return words.map((word, wi) => {
                  const dirMap = wi === 0 ? directions : directions2;
                  const letters = word.split("").map((char, ci) => {
                    const dir = dirMap[ci] || "down";
                    const delay = globalIdx * 120;
                    globalIdx++;
                    return (
                      <span
                        key={`${wi}-${ci}`}
                        className="inline-block transition-all duration-900 ease-out"
                        style={{
                          opacity: textVisible ? 1 : 0,
                          transform: textVisible ? "translate(0,0)" : getTransform(dir),
                          transitionDelay: `${delay}ms`,
                        }}
                      >
                        {char}
                      </span>
                    );
                  });
                  globalIdx++;
                  return (
                    <span key={wi} className="inline-flex">
                      {letters}
                      {wi < words.length - 1 && <span>&nbsp;</span>}
                    </span>
                  );
                });
              })()}
            </h2>

            {l(about, "title") ? (
              <h3 className="text-lg sm:text-xl font-bold text-[#2563eb] mb-4">
                {l(about, "title")}
              </h3>
            ) : <span className="hidden" />}

            {l(about, "mission") ? (
              <p className="text-[#7e8590] text-sm mb-3">{l(about, "mission")}</p>
            ) : <span className="hidden" />}

            <p className="text-[#364052] leading-relaxed mb-6 text-base">
              {l(about, "description")}
            </p>

            {features.length > 0 ? (
              <div className="space-y-3 mb-8">
                {features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#2563eb]/10 flex items-center justify-center shrink-0">
                      <FiCheck size={12} className="text-[#2563eb]" />
                    </span>
                    <p className="text-[#364052] text-sm font-medium">{feat}</p>
                  </div>
                ))}
              </div>
            ) : <span className="hidden" />}

            <div>
              <button
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-solvior cursor-pointer btn-pulse"
              >
                <span className="btn-icon">
                  <FiArrowRight size={18} />
                </span>
                <span className="btn-text">{t("about.getInTouch")}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default About;
