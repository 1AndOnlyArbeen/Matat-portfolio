import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTeamMembers } from "../api";
import {
  FiArrowLeft,
  FiLinkedin,
  FiGithub,
  FiTwitter,
} from "react-icons/fi";
import useLang from "../hooks/useLang";
import useSectionHeading from "../hooks/useSectionHeading";

function AllTeam() {
  const { t } = useTranslation();
  const l = useLang();
  const heading = useSectionHeading("team");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamMembers()
      .then((res) => {
        const list = res?.teams || (Array.isArray(res) ? res : []);
        setMembers(list);
        setLoading(false);
      })
      .catch(() => {
        setMembers([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f0f4f8]">
        <div className="w-10 h-10 border-[3px] border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-20 sm:py-28 bg-[#f0f4f8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#0075ff] hover:text-[#051229] font-bold text-sm mb-8 transition-colors"
        >
          <FiArrowLeft size={16} /> Back to Home
        </Link>

        {/* header — admin-driven via Section Headings */}
        <div className="text-center mb-16">
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

        {members.length === 0 ? (
          <p className="text-center text-[#7e8590]">No team members yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-20 justify-items-center max-w-5xl mx-auto">
            {members.map((m, i) => {
              const socials = [
                {
                  url: m.linkedinUrl || m.social?.linkedin,
                  Icon: FiLinkedin,
                  label: "LinkedIn",
                },
                {
                  url: m.twitterUrl || m.social?.twitter,
                  Icon: FiTwitter,
                  label: "Twitter",
                },
                {
                  url: m.githubUrl || m.social?.github,
                  Icon: FiGithub,
                  label: "GitHub",
                },
              ];

              return (
                <div
                  key={m._id}
                  className="text-center w-60 group"
                  style={{
                    animation: `fadeUp 500ms ease-out ${i * 60}ms both`,
                  }}
                >
                  <div
                    className="relative w-60 mx-auto rounded-3xl overflow-hidden transition-all duration-500 group-hover:shadow-[0_28px_56px_rgba(15,35,65,0.22)]"
                    style={{
                      background: "rgba(255,255,255,0.5)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.7)",
                      boxShadow:
                        "0 14px 36px rgba(15,35,65,0.12), inset 0 0 0 1px rgba(255,255,255,0.45)",
                    }}
                  >
                    {/* image area — every photo is centred and cropped identically */}
                    <div className="relative w-full h-72 overflow-hidden bg-white">
                      <img
                        src={m.teamImage || m.image}
                        alt={l(m, "name")}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <div className="px-4 pt-4 pb-5 border-t border-white/60">
                      <h3 className="font-extrabold text-[17px] text-[#051229] tracking-tight leading-tight">
                        {l(m, "name")}
                      </h3>
                      <p className="text-[11px] text-[#0075ff] mt-1 tracking-[0.18em] uppercase font-semibold">
                        {l(m, "role")}
                      </p>

                      <div className="flex items-center justify-center gap-2 mt-3">
                        {socials.map(({ url, Icon, label }, si) => {
                          const cls =
                            "w-7 h-7 rounded-full bg-white/70 border border-[#0075ff]/20 text-[#364052] hover:bg-[#0075ff] hover:text-white hover:border-[#0075ff] hover:scale-110 flex items-center justify-center transition-all duration-300";
                          return (
                            <a
                              key={si}
                              href={url || undefined}
                              target={url ? "_blank" : undefined}
                              rel={url ? "noopener noreferrer" : undefined}
                              onClick={(e) => {
                                if (!url) e.preventDefault();
                              }}
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default AllTeam;
