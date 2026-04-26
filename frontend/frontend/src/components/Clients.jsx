import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getClients } from "../api";
import useScrollAnimation from "../hooks/useScrollAnimation";
import useSectionHeading from "../hooks/useSectionHeading";
import useLang from "../hooks/useLang";

function Clients() {
  const { t } = useTranslation();
  const l = useLang();
  const heading = useSectionHeading("clients");
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

  return (
    <section id="clients" className="py-24 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* pill badge header — every piece is admin-driven */}
        <div ref={headingRef} className={`text-center mb-14 animate-fade-up ${headingVisible ? "visible" : ""}`}>
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
            <p className="text-[#7e8590] max-w-xl mx-auto text-base">{heading.subtitle}</p>
          )}
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
              className="flex gap-8 sm:gap-12 logo-marquee-track"
            >
              {clients.map((client, i) => (
                <div
                  key={`${client._id}-${i}`}
                  className="shrink-0 w-36 sm:w-44 h-24 sm:h-28 flex items-center justify-center p-5 sm:p-6 group cursor-pointer"
                >
                  <img
                    src={client.logo}
                    alt={l(client, "clientName") || client.name}
                    className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 select-none"
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
