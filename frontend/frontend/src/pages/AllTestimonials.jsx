import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowLeft, FiStar, FiX } from "react-icons/fi";
import { getTestimonials } from "../api";
import useLang from "../hooks/useLang";
import useSectionHeading from "../hooks/useSectionHeading";

function AllTestimonials() {
  const { t } = useTranslation();
  const l = useLang();
  const heading = useSectionHeading("testimonials");
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    getTestimonials()
      .then((res) => {
        const list = res?.testimonial || res?.testimonials || (Array.isArray(res) ? res : []);
        setTestimonials(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f0f2f5]">
        <div className="w-10 h-10 border-[3px] border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-20 sm:py-28 bg-[#f0f2f5] min-h-screen">
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

        {testimonials.length === 0 ? (
          <p className="text-center text-[#7e8590] py-20">No testimonials yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {testimonials.map((item) => {
              const review = l(item, "reviewText") || item.text || "";
              return (
                <div
                  key={item._id}
                  className="relative h-full bg-white rounded-[1.75rem] p-7 sm:p-8 flex flex-col border border-white/60 hover:-translate-y-1.5 transition-transform duration-500"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(187,201,204,0.3), 0 20px 40px rgba(26,28,26,0.04), 0 8px 16px rgba(26,28,26,0.02)" }}
                >
                  <span className="absolute top-4 right-6 text-[#0075ff]/5 text-6xl select-none pointer-events-none" style={{ fontFamily: "Georgia, serif" }}>&#x275D;</span>

                  <div className="flex items-center gap-3 mb-5 relative z-10">
                    <div className="relative">
                      {item.avatar ? (
                        <img src={item.avatar} alt={l(item, "name")} className="w-12 h-12 rounded-full object-cover ring-4 ring-[#0075ff]/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#e9e8e5] ring-4 ring-[#0075ff]/10" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#051229] text-sm truncate">{l(item, "name")}</p>
                      <p className="text-[11px] text-[#7e8590] truncate">{l(item, "company")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <FiStar key={si} size={14} style={si < item.rating ? { fill: "#0075ff", color: "#0075ff" } : { color: "#d1d5db" }} />
                    ))}
                  </div>

                  <p className="text-[#364052] text-sm sm:text-base leading-relaxed italic line-clamp-4 mb-4">
                    &ldquo;{review}&rdquo;
                  </p>

                  <button onClick={() => setOpenItem(item)} className="text-[#0075ff] text-xs font-bold cursor-pointer hover:underline self-start mt-auto">
                    {t("testimonials.seeMore")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* full-review modal */}
      {openItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setOpenItem(null)}>
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpenItem(null)} className="absolute top-4 right-4 text-[#7e8590] hover:text-[#051229] transition-colors p-1 cursor-pointer">
              <FiX size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4 pr-6">
              {openItem.avatar ? (
                <img src={openItem.avatar} alt={l(openItem, "name")} className="w-14 h-14 rounded-full object-cover ring-4 ring-[#0075ff]/10" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#e9e8e5] ring-4 ring-[#0075ff]/10" />
              )}
              <div>
                <p className="font-bold text-[#051229]">{l(openItem, "name")}</p>
                <p className="text-xs text-[#7e8590]">{l(openItem, "company")}</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, si) => (
                <FiStar key={si} size={16} style={si < openItem.rating ? { fill: "#0075ff", color: "#0075ff" } : { color: "#d1d5db" }} />
              ))}
            </div>
            <p className="text-[#364052] text-base leading-relaxed italic">
              &ldquo;{l(openItem, "reviewText") || openItem.text || ""}&rdquo;
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default AllTestimonials;
