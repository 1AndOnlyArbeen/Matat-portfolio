import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useLang from "../hooks/useLang";
import { getAppById } from "../api";
import { FiArrowLeft, FiExternalLink, FiSmartphone, FiStar, FiDownload, FiX, FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";

function AppDetail() {
  const { t } = useTranslation();
  const l = useLang();
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    getAppById(id).then((res) => {
      setApp(res || null);
      setLoading(false);
    }).catch(() => {
      setApp(null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#7e8590]">
        <p className="text-lg mb-4">{t("appDetail.notFound")}</p>
        <Link to="/" className="text-[#0075ff] hover:text-[#051229] flex items-center gap-2 font-bold">
          <FiArrowLeft size={16} /> {t("appDetail.backHome")}
        </Link>
      </div>
    );
  }

  const screenshots = (app.screenshots || [])
    .map((s) => (typeof s === "string" ? s : s?.url))
    .filter(Boolean);
  const rating = app.rating || 0;

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevShot = () =>
    setLightboxIndex((i) => (i - 1 + screenshots.length) % screenshots.length);
  const nextShot = () =>
    setLightboxIndex((i) => (i + 1) % screenshots.length);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          to="/#apps"
          className="inline-flex items-center gap-2 text-[#0075ff] hover:text-[#051229] mb-8 text-sm font-bold transition-colors link-underline"
        >
          <FiArrowLeft size={16} /> {t("appDetail.backToApps")}
        </Link>

        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(5,18,41,0.15)] shrink-0">
            <img src={app.appIcon || app.icon} alt={l(app, "appName") || app.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-black text-[#051229] mb-2">{l(app, "appName") || app.name}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="flex items-center gap-1 text-[#0075ff] text-sm font-semibold">
                <FiSmartphone size={14} /> {l(app, "platform")}
              </span>
              {app.downloads && (
                <span className="flex items-center gap-1 text-[#7e8590] text-sm">
                  <FiDownload size={14} /> {app.downloads} {t("appDetail.downloads")}
                </span>
              )}
              <span className="flex items-center gap-1 text-yellow-500 text-sm">
                <FiStar size={14} className="fill-yellow-400" /> {rating}
              </span>
            </div>

            <p className="text-[#7e8590]">{l(app, "description")}</p>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-bold text-[#051229] mb-3">{t("appDetail.aboutApp")}</h2>
          <p className="text-[#364052] leading-relaxed">{l(app, "description")}</p>
        </div>

        {screenshots.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#051229] inline-flex items-center gap-2">
                <FiImage className="text-[#0075ff]" /> {t("appDetail.snapshots")}
              </h2>
              <span className="text-xs text-[#7e8590]">{screenshots.length} {screenshots.length > 1 ? t("appDetail.images") : t("appDetail.image")}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {screenshots.map((src, i) => (
                <button
                  key={i}
                  onClick={() => openLightbox(i)}
                  className="group relative aspect-video rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(5,18,41,0.12)] hover:shadow-[0_20px_50px_rgba(0,117,255,0.2)] transition-all duration-300 bg-[#e1e8f0]"
                >
                  <img src={src} alt={`${l(app, "appName") || app.name} snapshot ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-[#051229]/0 group-hover:bg-[#051229]/30 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {lightboxIndex !== null && (
          <div className="fixed inset-0 bg-[#051229]/95 z-50 flex flex-col backdrop-blur-md" onClick={closeLightbox}>
            <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm text-white/80">{lightboxIndex + 1} / {screenshots.length}</p>
              <button onClick={closeLightbox} className="text-white/80 hover:text-white hover:rotate-90 transition-transform p-2">
                <FiX size={28} />
              </button>
            </div>
            <div className="flex-1 relative flex items-center justify-center px-4 sm:px-12" onClick={(e) => e.stopPropagation()}>
              <img src={screenshots[lightboxIndex]} alt={`Snapshot ${lightboxIndex + 1}`} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
              {screenshots.length > 1 && (
                <>
                  <button onClick={prevShot} className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-[#0075ff] text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md hover:scale-110 transition-all cursor-pointer">
                    <FiChevronLeft size={26} />
                  </button>
                  <button onClick={nextShot} className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-[#0075ff] text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md hover:scale-110 transition-all cursor-pointer">
                    <FiChevronRight size={26} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-[#dfecfd]/50 rounded-2xl p-6 border border-[#0075ff]/10">
          <h3 className="text-sm font-bold text-[#051229] mb-4 uppercase tracking-wide">{t("appDetail.appInfo")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[#7e8590] text-xs mb-1">{t("appDetail.platform")}</p>
              <p className="text-[#051229] font-bold text-sm">{l(app, "platform")}</p>
            </div>
            {app.downloads && (
              <div>
                <p className="text-[#7e8590] text-xs mb-1">{t("appDetail.downloads")}</p>
                <p className="text-[#051229] font-bold text-sm">{app.downloads}</p>
              </div>
            )}
            <div>
              <p className="text-[#7e8590] text-xs mb-1">{t("appDetail.rating")}</p>
              <p className="text-[#051229] font-bold text-sm">{rating} / 5.0</p>
            </div>
            {app.link && app.link !== "#" && (
              <div>
                <p className="text-[#7e8590] text-xs mb-1">{t("appDetail.link")}</p>
                <a href={app.link} target="_blank" rel="noopener noreferrer" className="text-[#0075ff] hover:text-[#051229] text-sm font-bold flex items-center gap-1">
                  {t("appDetail.visit")} <FiExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppDetail;
