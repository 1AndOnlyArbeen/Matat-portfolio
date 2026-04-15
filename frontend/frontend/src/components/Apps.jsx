import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getApps } from "../api";
import { FiSmartphone, FiArrowRight } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import useLang from "../hooks/useLang";

function Apps() {
  const { t } = useTranslation();
  const l = useLang();
  const [apps, setApps] = useState([]);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [sliderRef, sliderVisible] = useScrollAnimation(0.1);

  useEffect(() => {
    getApps().then((res) => {
      const list = res?.apps || (Array.isArray(res) ? res : []);
      if (list.length > 0) setApps(list);
    });
  }, []);

  if (apps.length === 0) return null;

  const appCard = (app) => (
    <div className="w-64 shrink-0 bg-white rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-center group card-hover border border-gray-100/60">
      {/* app icon */}
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-lg transition-shadow hover-shine">
        <img src={app.appIcon || app.icon} alt={l(app, "appName") || app.name} className="w-full h-full object-cover" />
      </div>

      <h3 className="text-lg font-bold text-[#051229] mb-1">{l(app, "appName") || app.name}</h3>

      <div className="flex items-center justify-center gap-1 text-[#0075ff] text-xs mb-3 font-semibold">
        <FiSmartphone size={12} />
        <span>{l(app, "platform")}</span>
      </div>

      <p className="text-[#7e8590] text-sm mb-4 line-clamp-3">{l(app, "description")}</p>

      <Link
        to={`/apps/${app._id}`}
        className="inline-flex items-center gap-1 text-[#0075ff] hover:text-[#051229] text-sm font-bold transition-colors group/link link-underline"
      >
        {t("apps.learnMore")} <FiArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </div>
  );

  return (
    <section id="apps" className="py-24 sm:py-28 bg-[#e1e8f0]/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div ref={headingRef} className={`text-center mb-14 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <span className="section-label">{t("apps.title")}</span>
          <h2 className="section-title">{t("apps.title")}</h2>
          <p className="text-[#7e8590] max-w-xl mx-auto text-base">
            {t("apps.subtitle")}
          </p>
        </div>

        <div ref={sliderRef} className={`animate-fade-up ${sliderVisible ? "visible" : ""}`}>
          {apps.length >= 4 ? (
            <div className="overflow-hidden">
              <div className="flex gap-5 animate-marquee-apps hover:[animation-play-state:paused]">
                {apps.map((app) => (
                  <div key={app._id}>{appCard(app)}</div>
                ))}
                {apps.map((app) => (
                  <div key={`dup-${app._id}`}>{appCard(app)}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              {apps.map((app) => (
                <div key={app._id}>{appCard(app)}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Apps;
