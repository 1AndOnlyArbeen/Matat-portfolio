import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getTeamMembers } from "../api";
import { FiLinkedin, FiGithub, FiTwitter, FiChevronLeft, FiChevronRight, FiGlobe } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import useLang from "../hooks/useLang";

function Team() {
  const { t } = useTranslation();
  const l = useLang();
  const [members, setMembers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [sliderRef, sliderVisible] = useScrollAnimation(0.1);
  const timerRef = useRef(null);

  useEffect(() => {
    getTeamMembers().then((res) => {
      const list = res?.teams || (Array.isArray(res) ? res : []);
      if (list.length > 0) setMembers(list);
    });
  }, []);

  const total = members.length;

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, [total]);

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % total);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + total) % total);

  if (total === 0) return null;

  return (
    <section id="team" className="py-24 sm:py-28 bg-[#f0f4f8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div ref={headingRef} className={`text-center mb-14 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="section-title">{t("team.title")}</h2>
          <p className="text-[#7e8590] max-w-xl mx-auto text-base">
            {t("team.subtitle")}
          </p>
        </div>

        <div ref={sliderRef} className={`relative animate-fade-up ${sliderVisible ? "visible" : ""}`}>
          <div className="relative mx-auto" style={{ height: "420px" }}>
            {members.map((member, i) => {
              const halfTotal = total / 2;
              const rawDiff = ((i - currentIndex) % total + total) % total;
              const signedDist = rawDiff > halfTotal ? rawDiff - total : rawDiff;
              const absDist = Math.abs(signedDist);

              if (absDist > 4) return null;

              const x = signedDist * 120;
              const scale = 1 - absDist * 0.1;
              const opacity = 1 - absDist * 0.13;
              const zIndex = 100 - absDist * 10;
              const isFront = absDist === 0;

              return (
                <div
                  key={member._id}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: "240px",
                    transform: `translateX(calc(-50% + ${x}px)) translateY(${isFront ? "calc(-50% - 10px)" : "-50%"}) scale(${isFront ? 1.08 : scale})`,
                    opacity: isFront ? 1 : opacity,
                    zIndex: isFront ? 100 : zIndex,
                    transition: "all 0.7s ease-in-out",
                    filter: isFront ? "none" : `blur(${Math.max(0, (1 - scale) * 2)}px)`,
                  }}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-500 overflow-hidden text-center group">
                    <div className="relative h-72 overflow-hidden">
                      <img
                        src={member.teamImage || member.image}
                        alt={l(member, "name")}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                        <h3 className="text-lg font-bold text-white">{l(member, "name")}</h3>
                        <p className="text-[#0075ff] text-sm font-semibold">{l(member, "role")}</p>
                        {l(member, "country") && (
                          <p className="text-white/80 text-xs mt-1 inline-flex items-center gap-1">
                            <FiGlobe size={11} /> {l(member, "country")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center gap-3 py-4 bg-white">
                      {(member.linkedinUrl || member.social?.linkedin) && (
                        <a href={member.linkedinUrl || member.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon !bg-[#e1e8f0] !text-[#364052] hover:!bg-[#0075ff] hover:!text-white">
                          <FiLinkedin size={16} />
                        </a>
                      )}
                      {(member.githubUrl || member.social?.github) && (
                        <a href={member.githubUrl || member.social.github} target="_blank" rel="noopener noreferrer" className="social-icon !bg-[#e1e8f0] !text-[#364052] hover:!bg-gray-800 hover:!text-white">
                          <FiGithub size={16} />
                        </a>
                      )}
                      {(member.twitterUrl || member.social?.twitter) && (
                        <a href={member.twitterUrl || member.social.twitter} target="_blank" rel="noopener noreferrer" className="social-icon !bg-[#e1e8f0] !text-[#364052] hover:!bg-[#0075ff] hover:!text-white">
                          <FiTwitter size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-[110] bg-white shadow-lg rounded-full p-2.5 text-[#364052] hover:bg-[#0075ff] hover:text-white transition-all cursor-pointer hover:scale-110">
            <FiChevronLeft size={22} />
          </button>
          <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-[110] bg-white shadow-lg rounded-full p-2.5 text-[#364052] hover:bg-[#0075ff] hover:text-white transition-all cursor-pointer hover:scale-110">
            <FiChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Team;
