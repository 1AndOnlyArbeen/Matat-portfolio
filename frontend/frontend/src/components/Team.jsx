import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getTeamMembers } from "../api";
import {
  FiLinkedin,
  FiGithub,
  FiTwitter,
  FiGlobe,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import useLang from "../hooks/useLang";

const AUTO_INTERVAL_MS = 5000;

function Team() {
  const { t } = useTranslation();
  const l = useLang();
  const [members, setMembers] = useState([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [bodyRef, bodyVisible] = useScrollAnimation(0.1);

  const rootRef = useRef(null);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    getTeamMembers().then((res) => {
      const list = res?.teams || (Array.isArray(res) ? res : []);
      if (list.length > 0) setMembers(list);
    });
  }, []);

  const total = members.length;

  // pause autoplay while section is off-screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // smooth autoplay progress bar
  useEffect(() => {
    if (!inView || total <= 1) return;
    let last = null;
    const tick = (ts) => {
      if (pausedRef.current) {
        last = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (last == null) last = ts;
      const dt = ts - last;
      last = ts;
      setProgress((p) => {
        const next = p + dt / AUTO_INTERVAL_MS;
        if (next >= 1) {
          setActive((a) => (a + 1) % total);
          return 0;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, total]);

  useEffect(() => {
    setProgress(0);
  }, [active]);

  const goNext = () => setActive((a) => (a + 1) % total);
  const goPrev = () => setActive((a) => (a - 1 + total) % total);

  if (total === 0) return null;

  const member = members[active];
  const socials = [
    {
      url: member.linkedinUrl || member.social?.linkedin,
      Icon: FiLinkedin,
      label: "LinkedIn",
    },
    {
      url: member.githubUrl || member.social?.github,
      Icon: FiGithub,
      label: "GitHub",
    },
    {
      url: member.twitterUrl || member.social?.twitter,
      Icon: FiTwitter,
      label: "Twitter",
    },
  ].filter((s) => s.url);

  return (
    <section
      ref={rootRef}
      id="team"
      className="relative py-24 sm:py-28 bg-[#f0f4f8] overflow-hidden"
    >
      {/* soft decorative blobs */}
      <div
        className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-[160px] opacity-25 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full blur-[180px] opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== header ===== */}
        <div
          ref={headingRef}
          className={`mb-12 sm:mb-14 animate-fade-up ${headingVisible ? "visible" : ""}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="relative w-2.5 h-2.5 rounded-full bg-[#2563eb] shadow-[0_0_14px_#2563eb]">
              <span className="absolute inset-0 rounded-full bg-[#2563eb] animate-ping opacity-60" />
            </span>
            <span className="text-[#2563eb] text-[11px] sm:text-xs font-bold tracking-[0.45em] uppercase">
              Our People
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#2563eb]/40 to-transparent" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#051229] leading-[1.05] tracking-tight max-w-3xl">
            {t("team.title")}
          </h2>
          <p className="mt-4 text-[#7e8590] max-w-xl text-base sm:text-lg">
            {t("team.subtitle")}
          </p>
        </div>

        {/* ===== body: featured member | thumbnail grid ===== */}
        <div
          ref={bodyRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch"
          style={{
            opacity: bodyVisible ? 1 : 0,
            transition: "opacity 600ms ease-out",
          }}
        >
          {/* ---------- FEATURED CARD ---------- */}
          <div
            className="lg:col-span-7 relative"
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
          >
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-[0_30px_70px_rgba(15,35,65,0.12)] h-full min-h-[460px]">
              <div className="grid grid-cols-1 sm:grid-cols-5 h-full">
                {/* portrait with cross-fade between members */}
                <div className="sm:col-span-3 relative h-80 sm:h-full overflow-hidden bg-[#0f2341]">
                  {members.map((m, i) => (
                    <img
                      key={m._id}
                      src={m.teamImage || m.image}
                      alt={l(m, "name")}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        opacity: i === active ? 1 : 0,
                        transform: i === active ? "scale(1)" : "scale(1.08)",
                        transition:
                          "opacity 900ms ease-out, transform 1400ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    />
                  ))}
                  {/* subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#051229]/50 via-transparent to-transparent pointer-events-none" />

                  {/* index badge */}
                  <div className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-pulse" />
                    <span className="text-white text-[11px] font-bold tracking-[0.25em] uppercase tabular-nums">
                      {String(active + 1).padStart(2, "0")} /{" "}
                      {String(total).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* info column */}
                <div className="sm:col-span-2 p-6 sm:p-8 flex flex-col justify-between min-h-[280px] relative">
                  {/* accent corner */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-[#2563eb]/15 via-[#7c3aed]/10 to-transparent rounded-bl-[5rem] pointer-events-none" />

                  <div key={active} className="relative animate-team-reveal">
                    <p className="text-[#2563eb] text-[11px] uppercase tracking-[0.3em] font-bold mb-3">
                      Team Member
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#051229] leading-tight mb-2">
                      {l(member, "name")}
                    </h3>
                    <p className="text-[#2563eb] text-sm sm:text-base font-bold mb-4">
                      {l(member, "role")}
                    </p>
                    {l(member, "country") && (
                      <p className="inline-flex items-center gap-1.5 text-[#7e8590] text-sm">
                        <FiGlobe size={13} />
                        {l(member, "country")}
                      </p>
                    )}
                  </div>

                  <div className="relative mt-6">
                    {socials.length > 0 && (
                      <div className="flex items-center gap-2 mb-5">
                        {socials.map(({ url, Icon, label }, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className="w-10 h-10 rounded-full bg-[#f0f2f5] text-[#364052] hover:bg-[#2563eb] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                          >
                            <Icon size={16} />
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={goPrev}
                        aria-label="Previous member"
                        className="w-11 h-11 rounded-full border border-[#e5e5e5] hover:border-[#2563eb] hover:bg-[#2563eb] hover:text-white text-[#364052] flex items-center justify-center transition-all cursor-pointer"
                      >
                        <FiArrowLeft size={16} />
                      </button>
                      <button
                        onClick={goNext}
                        aria-label="Next member"
                        className="w-11 h-11 rounded-full bg-[#051229] text-white hover:bg-[#2563eb] flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-[#051229]/20 hover:shadow-[#2563eb]/30 hover:scale-105"
                      >
                        <FiArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* autoplay progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#051229]/5">
                <div
                  className="h-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed]"
                  style={{
                    width: `${progress * 100}%`,
                    transition: "width 80ms linear",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ---------- THUMBNAIL GRID ---------- */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4">
              {members.slice(0, 6).map((m, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={m._id}
                    onClick={() => setActive(i)}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer text-left"
                    style={{
                      aspectRatio: "3 / 4",
                      transform: bodyVisible
                        ? "translateY(0)"
                        : "translateY(32px)",
                      opacity: bodyVisible ? 1 : 0,
                      transition: `opacity 600ms ease-out ${i * 90}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 90}ms`,
                    }}
                  >
                    <img
                      src={m.teamImage || m.image}
                      alt={l(m, "name")}
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                        isActive
                          ? "scale-105"
                          : "grayscale-[35%] group-hover:grayscale-0"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 transition-all duration-500 ${
                        isActive
                          ? "bg-gradient-to-t from-[#051229]/95 via-[#051229]/30 to-transparent"
                          : "bg-gradient-to-t from-[#051229]/75 via-transparent to-transparent"
                      }`}
                    />

                    {/* active ring */}
                    {isActive && (
                      <div className="absolute inset-0 ring-2 ring-[#2563eb] ring-offset-2 ring-offset-[#f0f4f8] rounded-2xl pointer-events-none" />
                    )}

                    {/* pinned info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <p className="text-white text-sm font-bold leading-tight truncate">
                        {l(m, "name")}
                      </p>
                      <p
                        className={`text-[11px] font-semibold truncate transition-colors duration-300 ${
                          isActive ? "text-[#60a5fa]" : "text-white/70"
                        }`}
                      >
                        {l(m, "role")}
                      </p>
                    </div>

                    {/* hover arrow */}
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FiArrowRight size={12} className="text-white" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* dot indicators (for > 6 members) */}
            {total > 6 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {members.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Go to member ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === active
                        ? "w-8 bg-[#2563eb]"
                        : "w-2 bg-[#d1d5db] hover:bg-[#2563eb]/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Team;
