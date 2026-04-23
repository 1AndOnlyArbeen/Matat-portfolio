import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { getAbout } from "../api";
import useLang from "../hooks/useLang";

function parseStatValue(raw) {
  const str = String(raw || "0").trim();
  const match = str.match(/^([\d,.]+)(.*)/);
  if (!match) return { num: 0, suffix: str };
  const num = parseFloat(match[1].replace(/,/g, ""));
  return { num: isNaN(num) ? 0 : num, suffix: match[2] || "" };
}

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

// ---------- stat card: big number hero + animated progress bar ----------
function StatRing({ rawValue, label, index, triggered, accent }) {
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
    const duration = 1800;
    const delay = index * 150;
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
      className="relative rounded-2xl bg-white/70 p-5 transition-colors duration-500 group overflow-hidden hover:bg-white"
      style={{
        opacity: triggered ? 1 : 0,
        transform: triggered
          ? "translateY(0) scale(1)"
          : "translateY(30px) scale(0.95)",
        transition: `opacity 700ms ease-out ${index * 120}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 120}ms`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(148,163,184,0.28)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.6), 0 12px 30px rgba(15,35,65,0.08)",
      }}
    >
      {/* accent corner glow */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-35 pointer-events-none"
        style={{ background: accent }}
      />

      <div className="relative">
        <p
          className="text-4xl sm:text-5xl font-black text-[#051229] tabular-nums leading-none tracking-tight"
        >
          {display}
          <span style={{ color: accent }}>{suffix}</span>
        </p>

        {/* animated progress bar */}
        <div className="mt-3 h-[3px] w-full rounded-full bg-[#051229]/10 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
              boxShadow: `0 0 10px ${accent}99`,
              transition: "width 50ms linear",
            }}
          />
        </div>

        <p className="mt-3 text-[#364052] text-[12px] sm:text-[13px] uppercase tracking-[0.16em] font-extrabold leading-snug">
          {label}
        </p>
      </div>

      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${accent}1a, transparent 70%)`,
        }}
      />
    </div>
  );
}

// ---------- headline with 3D letter-by-letter reveal ----------
function AnimatedHeadline({ text, visible }) {
  const chars = text.split("");
  return (
    <h2
      className="text-5xl sm:text-6xl md:text-7xl font-black text-[#051229] leading-[0.95] tracking-tight"
      style={{ perspective: 900 }}
    >
      {chars.map((c, i) => {
        const delay = i * 45;
        if (c === " ") return <span key={i}>&nbsp;</span>;
        return (
          <span
            key={i}
            className="inline-block"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible
                ? "rotateX(0deg) translateY(0)"
                : "rotateX(-85deg) translateY(30px)",
              transformOrigin: "50% 100%",
              transition: `opacity 600ms ease-out ${delay}ms, transform 800ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
            }}
          >
            {c}
          </span>
        );
      })}
    </h2>
  );
}

function About() {
  const { t } = useTranslation();
  const l = useLang();
  const [about, setAbout] = useState(null);
  const [statsTriggered, setStatsTriggered] = useState(false);
  const [headVisible, setHeadVisible] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const rootRef = useRef(null);
  const headRef = useRef(null);
  const bodyRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    getAbout().then((res) => {
      if (res) setAbout(res);
    });
  }, []);

  // scroll-in observers — reset when leaving so animation replays on return
  useEffect(() => {
    const bind = (el, set, th) => {
      if (!el) return () => {};
      const io = new IntersectionObserver(
        ([entry]) => set(entry.isIntersecting),
        { threshold: th }
      );
      io.observe(el);
      return () => io.disconnect();
    };
    const offs = [
      bind(headRef.current, setHeadVisible, 0.35),
      bind(bodyRef.current, setBodyVisible, 0.15),
      bind(statsRef.current, setStatsTriggered, 0.3),
    ];
    return () => offs.forEach((fn) => fn());
  }, [about]);

  // mouse parallax on the whole section
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      setMouse({ x, y });
    };
    const onLeave = () => setMouse({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!about) return null;

  const stats = about.stats || [];
  const accents = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24"];
  const features = [
    t("about.feature1", { defaultValue: "" }),
    t("about.feature2", { defaultValue: "" }),
    t("about.feature3", { defaultValue: "" }),
  ].filter(Boolean);

  return (
    <section
      ref={rootRef}
      id="about"
      className="relative py-24 sm:py-32 bg-[#f0f2f5] overflow-hidden"
    >
      {/* ===== soft mouse-reactive blobs (subtle, matches testimonials' clean feel) ===== */}
      <div
        className="absolute top-[-20%] left-[-15%] w-[40rem] h-[40rem] rounded-full blur-[160px] opacity-25 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 60%)",
          transform: `translate(${mouse.x * 20}px, ${mouse.y * 20}px)`,
          transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-15%] w-[45rem] h-[45rem] rounded-full blur-[180px] opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 60%)",
          transform: `translate(${-mouse.x * 30}px, ${-mouse.y * 30}px)`,
          transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== section label ===== */}
        <div
          ref={headRef}
          className="mb-6 flex items-center gap-3"
          style={{
            opacity: headVisible ? 1 : 0,
            transform: headVisible ? "translateX(0)" : "translateX(-24px)",
            transition:
              "opacity 600ms ease-out, transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <span className="relative w-2.5 h-2.5 rounded-full bg-[#2563eb] shadow-[0_0_14px_#2563eb]">
            <span className="absolute inset-0 rounded-full bg-[#2563eb] animate-ping opacity-60" />
          </span>
          <span className="text-[#2563eb] text-[11px] sm:text-xs font-bold tracking-[0.45em] uppercase">
            Who We Are
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#2563eb]/60 to-transparent" />
        </div>

        {/* ===== massive headline ===== */}
        <div className="mb-14 sm:mb-20">
          <AnimatedHeadline text={t("about.title")} visible={headVisible} />
        </div>

        {/* ===== body: text | bento ===== */}
        <div
          ref={bodyRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start"
        >
          {/* ---------- LEFT COLUMN: narrative ---------- */}
          <div className="lg:col-span-7 relative">
            {/* growing accent line */}
            <div
              className="absolute -left-5 top-1 bottom-0 w-px bg-gradient-to-b from-[#2563eb] via-[#7c3aed]/60 to-transparent origin-top"
              style={{
                transform: bodyVisible ? "scaleY(1)" : "scaleY(0)",
                transition:
                  "transform 1300ms cubic-bezier(0.22, 1, 0.36, 1) 200ms",
              }}
            />

            {l(about, "title") && (
              <h3
                className="text-lg sm:text-xl font-bold text-[#2563eb] mb-5"
                style={{
                  opacity: bodyVisible ? 1 : 0,
                  transform: bodyVisible ? "translateY(0)" : "translateY(16px)",
                  transition:
                    "opacity 600ms ease-out 300ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) 300ms",
                }}
              >
                {l(about, "title")}
              </h3>
            )}

            {l(about, "mission") && (
              <div
                className="relative pl-5 mb-5"
                style={{
                  opacity: bodyVisible ? 1 : 0,
                  transform: bodyVisible ? "translateY(0)" : "translateY(16px)",
                  transition:
                    "opacity 600ms ease-out 400ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) 400ms",
                }}
              >
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#2563eb]/50 rounded-full" />
                <p className="text-[#7e8590] italic text-sm leading-relaxed">
                  &ldquo;{l(about, "mission")}&rdquo;
                </p>
              </div>
            )}

            <p
              className="text-[#364052] leading-relaxed text-base sm:text-lg mb-8"
              style={{
                opacity: bodyVisible ? 1 : 0,
                transform: bodyVisible ? "translateY(0)" : "translateY(16px)",
                transition:
                  "opacity 600ms ease-out 500ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) 500ms",
              }}
            >
              {l(about, "description")}
            </p>

            {features.length > 0 && (
              <div className="space-y-3.5 mb-10">
                {features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 group"
                    style={{
                      opacity: bodyVisible ? 1 : 0,
                      transform: bodyVisible
                        ? "translateX(0)"
                        : "translateX(-24px)",
                      transition: `opacity 600ms ease-out ${600 + i * 120}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${600 + i * 120}ms`,
                    }}
                  >
                    <span className="mt-0.5 w-6 h-6 rounded-full border border-[#2563eb]/40 bg-[#2563eb]/10 flex items-center justify-center shrink-0 group-hover:bg-[#2563eb]/20 group-hover:scale-110 transition-all duration-300">
                      <FiCheck size={13} className="text-[#2563eb]" />
                    </span>
                    <p className="text-[#364052] text-sm sm:text-base font-medium leading-relaxed">
                      {feat}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white font-bold text-sm overflow-hidden cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform duration-300"
              style={{
                opacity: bodyVisible ? 1 : 0,
                transform: bodyVisible ? "translateY(0)" : "translateY(16px)",
                transition:
                  "opacity 700ms ease-out 1000ms, transform 300ms ease-out",
                boxShadow: "0 10px 40px rgba(37,99,235,0.35)",
              }}
            >
              <span className="relative z-10 tracking-wide">
                {t("about.getInTouch")}
              </span>
              <span className="relative z-10 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                <FiArrowRight size={14} />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#2563eb] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </div>

          {/* ---------- RIGHT COLUMN: bento (mouse parallax) ---------- */}
          <div
            className="lg:col-span-5 relative"
            style={{
              transform: `translate(${mouse.x * -10}px, ${mouse.y * -10}px)`,
              transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* section eyebrow */}
            <div
              className="flex items-center justify-between mb-5"
              style={{
                opacity: bodyVisible ? 1 : 0,
                transform: bodyVisible ? "translateY(0)" : "translateY(16px)",
                transition:
                  "opacity 600ms ease-out 200ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) 200ms",
              }}
            >
              <p className="text-[#2563eb] text-[11px] uppercase tracking-[0.35em] font-bold">
                By the numbers
              </p>
              <div className="flex gap-1.5">
                {accents.map((c, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: c, opacity: 0.8 }}
                  />
                ))}
              </div>
            </div>

            {/* stats bento grid */}
            <div ref={statsRef} className="grid grid-cols-2 gap-3.5">
              {stats.slice(0, 4).map((stat, i) => (
                <StatRing
                  key={i}
                  rawValue={l(stat, "value")}
                  label={l(stat, "label")}
                  index={i}
                  triggered={statsTriggered}
                  accent={accents[i % 4]}
                />
              ))}
            </div>

            {/* floating accent badge (same as before, re-styled) */}
            <div
              className="absolute -top-5 -right-2 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] shadow-[0_20px_40px_rgba(37,99,235,0.45)] animate-float-slow flex items-center justify-center rotate-12 pointer-events-none"
              style={{ animationDelay: "1s" }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
