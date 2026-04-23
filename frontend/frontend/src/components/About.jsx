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

// ---------- stat card with animated number + circular progress ring ----------
function StatRing({ rawValue, label, index, triggered, accent }) {
  const { num, suffix } = parseStatValue(rawValue);
  const [display, setDisplay] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  // normalize to 0..1 for the ring — big numbers still fill the ring
  const target = num <= 0 ? 0 : Math.min(num / (num > 100 ? num : 100), 1);

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
        setProgress(eased * target);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [triggered, num, target, index]);

  const size = 74;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - progress);

  return (
    <div
      className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4 hover:bg-white/[0.08] hover:border-white/20 transition-colors duration-500 group overflow-hidden"
      style={{
        opacity: triggered ? 1 : 0,
        transform: triggered
          ? "translateY(0) scale(1)"
          : "translateY(30px) scale(0.95)",
        transition: `opacity 700ms ease-out ${index * 120}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 120}ms`,
      }}
    >
      <div className="relative flex items-center gap-4">
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={stroke}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={accent}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              fill="none"
              style={{ filter: `drop-shadow(0 0 6px ${accent}88)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-black text-white tabular-nums leading-none">
              {display}
              <span style={{ color: accent }}>{suffix}</span>
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-white/70 text-[11px] uppercase tracking-[0.15em] font-bold leading-tight">
            {label}
          </p>
          <div
            className="mt-2 h-[2px] w-8 rounded-full"
            style={{ background: accent }}
          />
        </div>
      </div>
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 50%, ${accent}22, transparent 70%)`,
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
      className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[0.95] tracking-tight"
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

  const marqueeWords = [
    { text: "ABOUT", style: "fill" },
    { text: "US", style: "stroke-white" },
    { text: "•", style: "fill" },
    { text: "INNOVATE", style: "stroke-blue" },
    { text: "•", style: "fill" },
    { text: "CRAFT", style: "stroke-purple" },
    { text: "•", style: "fill" },
    { text: "VISION", style: "stroke-white" },
    { text: "•", style: "fill" },
  ];

  const renderMarqueeSet = (keyPrefix) => (
    <div className="flex items-center gap-10 sm:gap-14 px-6 shrink-0">
      {marqueeWords.map((w, i) => {
        const base =
          "text-5xl sm:text-6xl md:text-7xl font-black leading-none whitespace-nowrap select-none";
        if (w.style === "fill")
          return (
            <span key={`${keyPrefix}-${i}`} className={`${base} text-white/10`}>
              {w.text}
            </span>
          );
        const strokeColors = {
          "stroke-white": "rgba(255,255,255,0.28)",
          "stroke-blue": "rgba(37,99,235,0.65)",
          "stroke-purple": "rgba(124,58,237,0.55)",
        };
        return (
          <span
            key={`${keyPrefix}-${i}`}
            className={`${base} text-transparent`}
            style={{ WebkitTextStroke: `1.5px ${strokeColors[w.style]}` }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );

  return (
    <section
      ref={rootRef}
      id="about"
      className="relative py-24 sm:py-32 bg-[#070d1c] overflow-hidden"
    >
      {/* ===== animated aurora blobs (mouse-reactive) ===== */}
      <div
        className="absolute top-[-15%] left-[-10%] w-[45rem] h-[45rem] rounded-full blur-[140px] opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.45) 0%, transparent 60%)",
          transform: `translate(${mouse.x * 25}px, ${mouse.y * 25}px)`,
          transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[50rem] h-[50rem] rounded-full blur-[160px] opacity-50 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 60%)",
          transform: `translate(${-mouse.x * 35}px, ${-mouse.y * 35}px)`,
          transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {/* ===== subtle grid ===== */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* ===== top marquee strip ===== */}
      <div className="relative mb-16 sm:mb-20 overflow-hidden py-5 border-y border-white/[0.06]">
        <div className="flex animate-marquee-about w-max">
          {renderMarqueeSet("a")}
          {renderMarqueeSet("b")}
        </div>
        {/* edge fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070d1c] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070d1c] to-transparent" />
      </div>

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
          <span className="text-[#60a5fa] text-[11px] sm:text-xs font-bold tracking-[0.45em] uppercase">
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
                className="text-lg sm:text-xl font-bold text-[#60a5fa] mb-5"
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
                <p className="text-white/65 italic text-sm leading-relaxed">
                  &ldquo;{l(about, "mission")}&rdquo;
                </p>
              </div>
            )}

            <p
              className="text-white/85 leading-relaxed text-base sm:text-lg mb-8"
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
                    <span className="mt-0.5 w-6 h-6 rounded-full border border-[#2563eb]/60 bg-[#2563eb]/10 flex items-center justify-center shrink-0 group-hover:bg-[#2563eb]/30 group-hover:scale-110 transition-all duration-300">
                      <FiCheck size={13} className="text-[#60a5fa]" />
                    </span>
                    <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed">
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
            {/* orbital feature card */}
            <div
              className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0f2341] via-[#162d50] to-[#0a1628] p-8 mb-5 border border-white/[0.06] shadow-[0_30px_80px_rgba(10,22,40,0.6)]"
              style={{
                opacity: bodyVisible ? 1 : 0,
                transform: bodyVisible
                  ? "translateY(0) scale(1)"
                  : "translateY(40px) scale(0.96)",
                transition:
                  "opacity 800ms ease-out 200ms, transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 200ms",
              }}
            >
              {/* corner accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563eb]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#7c3aed]/20 rounded-full blur-2xl pointer-events-none" />

              {/* diagonal stripes */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,1) 10px, rgba(255,255,255,1) 11px)",
                }}
              />

              {/* orbital visual */}
              <div className="relative h-36 flex items-center justify-center">
                {/* rings */}
                <div className="absolute w-28 h-28 rounded-full border border-white/10" />
                <div className="absolute w-40 h-40 rounded-full border border-white/[0.06]" />

                {/* counter-rotating orbit w/ a dot */}
                <div className="absolute w-40 h-40 animate-spin-slow">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#60a5fa] shadow-[0_0_14px_#60a5fa]" />
                </div>
                <div className="absolute w-28 h-28 animate-spin-reverse">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#fbbf24] shadow-[0_0_12px_#fbbf24]" />
                </div>
                <div className="absolute w-40 h-40 animate-spin-slow" style={{ animationDuration: "26s" }}>
                  <div className="absolute bottom-1 right-4 w-1.5 h-1.5 rounded-full bg-[#a78bfa] shadow-[0_0_10px_#a78bfa]" />
                </div>

                {/* center monogram */}
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.55)]">
                  <span className="text-white font-black text-2xl tracking-tight">
                    M
                  </span>
                </div>
              </div>

              <div className="relative mt-5 flex items-center justify-between">
                <p className="text-[#60a5fa] text-[10px] uppercase tracking-[0.35em] font-bold">
                  By the numbers
                </p>
                <div className="flex gap-1.5">
                  {accents.map((c, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: c, opacity: 0.7 }}
                    />
                  ))}
                </div>
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
