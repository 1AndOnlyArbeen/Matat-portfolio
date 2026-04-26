import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTeamMembers } from "../api";
import {
  FiLinkedin,
  FiGithub,
  FiTwitter,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import useSectionHeading from "../hooks/useSectionHeading";
import useLang from "../hooks/useLang";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const PER_PAGE = 4;

function Team() {
  const { t } = useTranslation();
  const l = useLang();
  const heading = useSectionHeading("team");
  const [members, setMembers] = useState([]);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation(0.1);

  useEffect(() => {
    getTeamMembers().then((res) => {
      const list = res?.teams || (Array.isArray(res) ? res : []);
      if (list.length > 0) setMembers(list);
    });
  }, []);

  if (members.length === 0) return null;

  const visible = members.slice(0, PER_PAGE);

  return (
    <section id="team" className="py-24 sm:py-28 bg-[#f0f4f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== header — admin-driven via Section Headings ===== */}
        <div
          ref={headingRef}
          className={`text-center mb-16 sm:mb-20 animate-fade-up ${headingVisible ? "visible" : ""}`}
        >
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
            <p className="text-[#7e8590] max-w-xl mx-auto text-base">
              {heading.subtitle}
            </p>
          )}
        </div>

        {/* ===== Swiper slider — one card at a time on mobile, multiple on bigger screens ===== */}
        <div ref={gridRef} className={`relative max-w-5xl mx-auto animate-fade-up ${gridVisible ? "visible" : ""}`}>
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{ prevEl: ".team-prev", nextEl: ".team-next" }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={visible.length > 4}
            breakpoints={{
              640:  { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 12 },
            }}
            // pt gives breathing space inside the swiper so the floating image at -top-14/-16 isn't clipped
            className="!pt-16 !pb-2"
          >
            {visible.map((m) => {
              const socials = [
                { url: m.linkedinUrl || m.social?.linkedin, Icon: FiLinkedin, label: "LinkedIn" },
                { url: m.twitterUrl || m.social?.twitter, Icon: FiTwitter, label: "Twitter" },
                { url: m.githubUrl || m.social?.github, Icon: FiGithub, label: "GitHub" },
              ];
              return (
                <SwiperSlide key={m._id} className="!h-auto">
                  <div className="text-center w-full max-w-[15rem] mx-auto group h-full flex">
                    {/* single unified frosted card — flex column so every card stretches to the same height */}
                    <div
                      className="relative w-full mx-auto rounded-3xl overflow-visible transition-all duration-500 group-hover:shadow-[0_28px_56px_rgba(15,35,65,0.22)] flex flex-col h-full"
                      style={{
                        background: "rgba(255,255,255,0.5)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.7)",
                        boxShadow:
                          "0 14px 36px rgba(15,35,65,0.12), inset 0 0 0 1px rgba(255,255,255,0.45)",
                      }}
                    >
                      {/* image area — image overflows above the card top (the "floating" style) */}
                      <div className="relative h-72 shrink-0">
                        <img
                          src={m.teamImage || m.image}
                          alt={l(m, "name")}
                          className="absolute -top-14 left-1/2 -translate-x-1/2 w-56 h-80 object-cover rounded-xl transition-all duration-500 group-hover:-top-16 drop-shadow-[0_14px_24px_rgba(15,35,65,0.18)]"
                          loading="lazy"
                        />
                      </div>

                      {/* info area grows so social row pins to the bottom across all cards */}
                      <div className="px-4 pt-4 pb-5 border-t border-white/60 flex flex-col flex-1">
                        <h3 className="font-extrabold text-[17px] text-[#051229] tracking-tight leading-tight line-clamp-1">
                          {l(m, "name")}
                        </h3>
                        <p className="text-[11px] text-[#0075ff] mt-1 tracking-[0.18em] uppercase font-semibold line-clamp-1">
                          {l(m, "role")}
                        </p>

                        <div className="flex items-center justify-center gap-2 mt-auto pt-3">
                          {socials.map(({ url, Icon, label }, si) => {
                            const cls =
                              "w-7 h-7 rounded-full bg-white/70 border border-[#0075ff]/20 text-[#364052] hover:bg-[#0075ff] hover:text-white hover:border-[#0075ff] hover:scale-110 flex items-center justify-center transition-all duration-300";
                            return (
                              <a
                                key={si}
                                href={url || undefined}
                                target={url ? "_blank" : undefined}
                                rel={url ? "noopener noreferrer" : undefined}
                                onClick={(e) => { if (!url) e.preventDefault(); }}
                                aria-label={label}
                                className={cls}
                                style={!url ? { cursor: "default" } : undefined}
                              >
                                <Icon size={12} />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {visible.length > 1 && (
            <div className="flex sm:hidden justify-center gap-3 mt-5">
              <button
                className="team-prev w-10 h-10 rounded-full border border-[#d1d5db] flex items-center justify-center hover:bg-[#0075ff]/5 transition-all cursor-pointer"
                aria-label="Previous"
              >
                <FiChevronLeft size={18} className="text-[#0075ff]" />
              </button>
              <button
                className="team-next w-10 h-10 rounded-full bg-[#0075ff] flex items-center justify-center hover:bg-[#0075ff]/90 transition-all shadow-lg shadow-[#0075ff]/20 cursor-pointer"
                aria-label="Next"
              >
                <FiChevronRight size={18} className="text-white" />
              </button>
            </div>
          )}

          {/* ===== see more ===== */}
          <div className="mt-14 sm:mt-16 flex justify-center">
            <Link
              to="/team/all"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#051229] text-white font-bold text-sm hover:bg-[#0075ff] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#051229]/20 hover:shadow-[#0075ff]/30"
            >
              <span className="tracking-wide">See More Members</span>
              <FiArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Team;
