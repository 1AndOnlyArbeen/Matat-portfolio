import { useState, useEffect, useRef } from "react";
import { getTeamMembers } from "../api";
import { FiLinkedin, FiGithub, FiTwitter, FiChevronLeft, FiChevronRight, FiGlobe } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

function Team() {
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

  const angleStep = 360 / total;

  return (
    <section id="team" className="py-20 bg-blue-50 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div ref={headingRef} className={`text-center mb-14 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">Meet Our Team</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            The talented people behind our success.
          </p>
        </div>

        <div ref={sliderRef} className={`relative animate-fade-up ${sliderVisible ? "visible" : ""}`}>
          <div className="relative mx-auto" style={{ height: "420px" }}>
            {members.map((member, i) => {
              // signed distance from the front card (negative = left, positive = right)
              // wraps around so the carousel loops smoothly
              const halfTotal = total / 2;
              const rawDiff = ((i - currentIndex) % total + total) % total;
              const signedDist = rawDiff > halfTotal ? rawDiff - total : rawDiff;
              const absDist = Math.abs(signedDist);

              // show only 4 on each side + 1 in the middle (max 9 cards visible)
              if (absDist > 4) return null;

              // linear horizontal positioning: each step is 120px apart
              const x = signedDist * 120;
              // shrink as cards move away from center: 1.0 at front → 0.6 at the edges
              const scale = 1 - absDist * 0.1;
              // fade as cards move away: 1.0 at front → 0.45 at the edges
              const opacity = 1 - absDist * 0.13;
              // front card sits highest, layers cascade behind it
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
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                        <h3 className="text-lg font-bold text-white">{member.name}</h3>
                        <p className="text-blue-300 text-sm">{member.role}</p>
                        {member.country && (
                          <p className="text-white/80 text-xs mt-1 inline-flex items-center gap-1">
                            <FiGlobe size={11} /> {member.country}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 py-4 bg-white">
                      {(member.linkedinUrl || member.social?.linkedin) && (
                        <a href={member.linkedinUrl || member.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                          <FiLinkedin size={16} />
                        </a>
                      )}
                      {(member.githubUrl || member.social?.github) && (
                        <a href={member.githubUrl || member.social.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-300">
                          <FiGithub size={16} />
                        </a>
                      )}
                      {(member.twitterUrl || member.social?.twitter) && (
                        <a href={member.twitterUrl || member.social.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all duration-300">
                          <FiTwitter size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-[110] bg-white shadow-lg rounded-full p-2.5 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
            <FiChevronLeft size={22} />
          </button>
          <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-[110] bg-white shadow-lg rounded-full p-2.5 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
            <FiChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Team;
