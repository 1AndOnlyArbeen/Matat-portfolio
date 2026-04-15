import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getClients } from "../api";
import useScrollAnimation from "../hooks/useScrollAnimation";
import useLang from "../hooks/useLang";

function Clients() {
  const { t } = useTranslation();
  const l = useLang();
  const [clients, setClients] = useState([]);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [marqueeRef, marqueeVisible] = useScrollAnimation(0.1);
  const trackRef = useRef(null);

  useEffect(() => {
    getClients().then((res) => {
      const list = res?.clients || (Array.isArray(res) ? res : []);
      if (list.length > 0) setClients(list);
    });
  }, []);

  if (clients.length === 0) return null;

  // duplicate list for seamless infinite loop
  const logos = [...clients, ...clients];

  return (
    <section id="clients" className="py-24 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* pill badge header */}
        <div ref={headingRef} className={`text-center mb-14 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <span className="inline-block bg-[#0075ff]/10 text-[#0075ff] text-xs sm:text-sm font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-5">
            {t("clients.title")}
          </span>
          <h2 className="section-title">{t("clients.title")}</h2>
          <p className="text-[#7e8590] max-w-xl mx-auto text-base">
            {t("clients.subtitle")}
          </p>
        </div>

        {/* logo marquee — inside the same max-w container */}
        <div
          ref={marqueeRef}
          className={`animate-fade-up ${marqueeVisible ? "visible" : ""}`}
        >
          <div className="relative overflow-hidden logo-marquee-wrap">
            {/* gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            {/* scrolling track */}
            <div
              ref={trackRef}
              className="flex gap-5 sm:gap-6 logo-marquee-track"
            >
              {logos.map((client, i) => (
                <div
                  key={`${client._id}-${i}`}
                  className="shrink-0 w-36 sm:w-44 h-24 sm:h-28 bg-[#f3f4f6] rounded-2xl flex items-center justify-center p-5 sm:p-6 group transition-all duration-300 hover:bg-[#e9eaec] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                >
                  <img
                    src={client.logo}
                    alt={l(client, "clientName") || client.name}
                    className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 select-none"
                    draggable="false"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Clients;
