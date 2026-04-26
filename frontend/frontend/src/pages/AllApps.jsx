import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowLeft, FiSmartphone } from "react-icons/fi";
import { getApps } from "../api";
import useLang from "../hooks/useLang";
import useSectionHeading from "../hooks/useSectionHeading";

function AllApps() {
  const { t } = useTranslation();
  const l = useLang();
  const heading = useSectionHeading("apps");
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApps()
      .then((res) => {
        const list = res?.apps || (Array.isArray(res) ? res : []);
        setApps(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#e1e8f0]/40">
        <div className="w-10 h-10 border-[3px] border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-20 sm:py-28 bg-[#e1e8f0]/40 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[#0075ff] hover:text-[#051229] font-bold text-sm mb-8 transition-colors">
          <FiArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-12 sm:mb-16">
          {heading.label && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0075ff]/5 border border-[#0075ff]/10 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0075ff] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0075ff]" />
              </span>
              <span className="text-xs font-bold tracking-widest text-[#0075ff] uppercase">{heading.label}</span>
            </div>
          )}
          {(heading.titlePlain || heading.titleHighlight) && (
            <h2 className="section-title">
              {heading.titlePlain}{heading.titlePlain && heading.titleHighlight && " "}
              {heading.titleHighlight && <span className="text-[#0075ff]">{heading.titleHighlight}</span>}
            </h2>
          )}
          {heading.subtitle && <p className="text-[#7e8590] max-w-xl mx-auto text-base">{heading.subtitle}</p>}
        </div>

        {apps.length === 0 ? (
          <p className="text-center text-[#7e8590] py-20">No apps yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center">
            {apps.map((app) => (
              <div key={app._id} className="w-full max-w-[16rem] h-full bg-white rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-center group card-hover border border-gray-100/60 flex flex-col">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-lg transition-shadow hover-shine">
                  <img src={app.appIcon || app.icon} alt={l(app, "appName") || app.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-bold text-[#051229] mb-1 line-clamp-1">{l(app, "appName") || app.name}</h3>
                <div className="flex items-center justify-center gap-1 text-[#0075ff] text-xs mb-3 font-semibold">
                  <FiSmartphone size={12} />
                  <span className="line-clamp-1">{l(app, "platform")}</span>
                </div>
                <p className="text-[#7e8590] text-sm mb-4 line-clamp-3 flex-1">{l(app, "description")}</p>
                <Link to={`/apps/${app._id}`} className="inline-flex items-center justify-center text-[#0075ff] hover:text-[#051229] text-sm font-bold transition-colors group/link link-underline mt-auto">
                  {t("apps.learnMore")}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AllApps;
