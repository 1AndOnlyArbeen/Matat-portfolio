import { useState, useEffect } from "react";
import { getTeamMembers } from "../api";
import { teamData as fallback } from "../data/placeholders";
import { FiLinkedin, FiGithub, FiTwitter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// team members section - slider with multiple cards per slide
function Team() {
  const [members, setMembers] = useState(fallback);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [sliderRef, sliderVisible] = useScrollAnimation(0.1);

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

        {/* slider */}
        <div ref={sliderRef} className={`relative animate-fade-up ${sliderVisible ? "visible" : ""}`}>
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: ".team-prev",
              nextEl: ".team-next",
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={members.length > 2}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
          >
            {members.map((member) => (
              <SwiperSlide key={member._id}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden text-center group hover:-translate-y-2">
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
              </SwiperSlide>
            ))}
          </Swiper>

          {/* custom nav arrows */}
          <button className="team-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white shadow-lg rounded-full p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
            <FiChevronLeft size={22} />
          </button>
          <button className="team-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white shadow-lg rounded-full p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer">
            <FiChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Team;
