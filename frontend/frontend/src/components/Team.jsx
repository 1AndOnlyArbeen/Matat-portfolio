import { useState, useEffect } from "react";
import { getTeamMembers } from "../api";
import { teamData as fallback } from "../data/placeholders";
import { FiLinkedin, FiGithub, FiTwitter } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

// team members section - photo cards with name, role and social links
function Team() {
  const [members, setMembers] = useState(fallback);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation(0.1);

  // load team from backend
  useEffect(() => {
    getTeamMembers().then((res) => {
      if (res && res.length > 0) setMembers(res);
    });
  }, []);

  return (
    <section id="team" className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div ref={headingRef} className={`text-center mb-12 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">Meet Our Team</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            The talented people behind our success.
          </p>
        </div>

        {/* member cards */}
        <div ref={gridRef} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children ${gridVisible ? "visible" : ""}`}>
          {members.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden text-center group hover:-translate-y-2"
            >
              {/* member photo - zooms on hover */}
              <div className="h-56 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-blue-900">{member.name}</h3>
                <p className="text-blue-500 text-sm mb-3">{member.role}</p>

                {/* social links */}
                <div className="flex justify-center gap-3">
                  {member.social?.linkedin && (
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors hover:scale-110 inline-block">
                      <FiLinkedin size={18} />
                    </a>
                  )}
                  {member.social?.github && (
                    <a href={member.social.github} className="text-gray-400 hover:text-blue-600 transition-colors hover:scale-110 inline-block">
                      <FiGithub size={18} />
                    </a>
                  )}
                  {member.social?.twitter && (
                    <a href={member.social.twitter} className="text-gray-400 hover:text-blue-600 transition-colors hover:scale-110 inline-block">
                      <FiTwitter size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Team;
