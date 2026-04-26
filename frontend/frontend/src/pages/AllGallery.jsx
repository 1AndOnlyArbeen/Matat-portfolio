import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiArrowLeft,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiCalendar,
  FiImage,
  FiArrowUpRight,
  FiTag,
} from "react-icons/fi";
import { getGallery } from "../api";
import useLang from "../hooks/useLang";
import useSectionHeading from "../hooks/useSectionHeading";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

function AllGallery() {
  const { t } = useTranslation();
  const l = useLang();
  const sectionHeading = useSectionHeading("gallery");
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAlbum, setOpenAlbum] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    getGallery()
      .then((res) => {
        setAlbums(res && res.length > 0 ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setAlbums([]);
        setLoading(false);
      });
  }, []);

  const open = (album) => {
    setOpenAlbum(album);
    setPhotoIndex(0);
  };
  const close = () => setOpenAlbum(null);

  useEffect(() => {
    if (!openAlbum) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openAlbum]);

  const toUrl = (i) => (typeof i === "string" ? i : i?.url);
  const photos = openAlbum?.images?.length
    ? openAlbum.images.map(toUrl).filter(Boolean)
    : openAlbum?.thumbnail
    ? [openAlbum.thumbnail]
    : openAlbum?.image
    ? [openAlbum.image]
    : [];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-[3px] border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="relative py-20 sm:py-28 bg-white min-h-screen overflow-hidden">
      {/* decorative blobs to match the home gallery vibe */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#0075ff]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#0075ff]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* back link */}
        <Link
          to="/#gallery"
          className="inline-flex items-center gap-2 text-[#0075ff] hover:text-[#051229] font-bold text-sm mb-8 transition-colors"
        >
          <FiArrowLeft size={16} /> Back to Home
        </Link>

        {/* header — same admin-driven heading the home section uses */}
        <div className="text-center mb-12 sm:mb-16">
          {sectionHeading.label && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0075ff]/5 border border-[#0075ff]/10 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0075ff] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0075ff]" />
              </span>
              <span className="text-xs font-bold tracking-widest text-[#0075ff] uppercase">
                {sectionHeading.label}
              </span>
            </div>
          )}
          {(sectionHeading.titlePlain || sectionHeading.titleHighlight) && (
            <h2 className="section-title">
              {sectionHeading.titlePlain}
              {sectionHeading.titlePlain && sectionHeading.titleHighlight && " "}
              {sectionHeading.titleHighlight && (
                <span className="text-[#0075ff]">{sectionHeading.titleHighlight}</span>
              )}
            </h2>
          )}
          {sectionHeading.subtitle && (
            <p className="text-[#7e8590] max-w-xl mx-auto text-base sm:text-lg">
              {sectionHeading.subtitle}
            </p>
          )}
        </div>

        {albums.length === 0 ? (
          <p className="text-center text-[#7e8590] py-20">No albums yet.</p>
        ) : (
          // uniform grid — every album the same 4/3 tile so the gallery reads as one calm grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {albums.map((album) => {
              const count = album.images?.length || 1;
              return (
                <button
                  key={album._id}
                  onClick={() => open(album)}
                  className="group relative text-left cursor-pointer rounded-3xl overflow-hidden bg-white shadow-[0_10px_40px_rgba(5,18,41,0.12)] hover:shadow-[0_20px_50px_rgba(0,117,255,0.25)] hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e1e8f0]">
                    {(() => {
                      const imgs = (album.images || []).map(toUrl).filter(Boolean);
                      const cover = album.thumbnail || album.image || imgs[0];
                      return (
                        <>
                          {imgs[2] && (
                            <img src={imgs[2]} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-95 -rotate-2 opacity-40 blur-sm" />
                          )}
                          {imgs[1] && (
                            <img src={imgs[1]} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-[0.98] rotate-1 opacity-60" />
                          )}
                          {cover && (
                            <img src={cover} alt={l(album, "place")} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                          )}
                        </>
                      );
                    })()}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#051229]/85 via-[#051229]/20 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#0075ff] shadow-md opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shrink-0">
                        <FiArrowUpRight size={14} />
                      </div>

                      {l(album, "caption") ? (
                        <div className="flex-1 min-w-0 flex justify-center">
                          <div className="bg-[#0075ff]/95 backdrop-blur-sm text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-lg inline-flex items-center gap-1 max-w-full">
                            <FiTag size={11} className="shrink-0" />
                            <span className="truncate">{l(album, "caption")}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1" />
                      )}

                      <div className="bg-white/95 backdrop-blur-md text-[#0075ff] text-[11px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 shadow-md shrink-0">
                        <FiImage size={11} />
                        {count}
                      </div>
                    </div>

                    {(album.date || l(album, "place")) && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                        {album.date ? (
                          <p className="text-[10px] sm:text-xs font-extrabold tracking-wide uppercase text-white inline-flex items-center gap-1 drop-shadow-md min-w-0 flex-1 truncate">
                            <FiCalendar size={12} className="shrink-0" />
                            <span className="truncate">
                              {new Date(album.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          </p>
                        ) : (
                          <span className="flex-1" />
                        )}
                        {l(album, "place") && (
                          <p className="text-[10px] sm:text-xs font-extrabold tracking-wide uppercase text-white inline-flex items-center gap-1 drop-shadow-md min-w-0 flex-1 truncate justify-end text-right">
                            <FiMapPin size={12} className="text-[#0075ff] shrink-0" />
                            <span className="truncate">{l(album, "place")}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* lightbox — identical to home Gallery */}
      {openAlbum && (
        <div
          className="fixed inset-0 bg-[#051229]/95 z-50 flex flex-col backdrop-blur-md"
          onClick={close}
        >
          <div
            className="flex items-start justify-between p-4 sm:p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold tracking-widest text-[#0075ff] uppercase mb-1 inline-flex items-center gap-1.5">
                {openAlbum.date && (
                  <>
                    <FiCalendar size={12} />
                    {new Date(openAlbum.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </>
                )}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold inline-flex items-center gap-2 truncate">
                <FiMapPin size={20} className="text-[#0075ff] shrink-0" />
                <span className="truncate">{l(openAlbum, "place") || l(openAlbum, "caption")}</span>
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mt-1 inline-flex items-center gap-1.5">
                <FiImage size={12} /> {photoIndex + 1} {t("gallery.of")} {photos.length}
              </p>
            </div>
            <button
              onClick={close}
              className="text-white/70 hover:text-white hover:rotate-90 cursor-pointer transition-all p-2"
            >
              <FiX size={28} />
            </button>
          </div>

          <div
            className="flex-1 relative flex items-center justify-center min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Swiper
              modules={[Navigation, Keyboard, EffectFade]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              speed={500}
              keyboard={{ enabled: true }}
              navigation={{
                prevEl: ".gallery-lightbox-prev-all",
                nextEl: ".gallery-lightbox-next-all",
              }}
              loop={photos.length > 1}
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={(s) => setPhotoIndex(s.realIndex)}
              className="w-full h-full"
            >
              {photos.map((src, i) => (
                <SwiperSlide key={i} className="!flex items-center justify-center px-4 sm:px-16">
                  <div className="w-full h-full max-h-[75vh] flex items-center justify-center">
                    <img
                      src={src}
                      alt={`${l(openAlbum, "place") || l(openAlbum, "caption")} photo ${i + 1}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
                      draggable="false"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {photos.length > 1 && (
              <>
                <button
                  className="gallery-lightbox-prev-all absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-[#0075ff] text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md transition-all cursor-pointer hover:scale-110"
                  aria-label={t("gallery.prevPhoto")}
                >
                  <FiChevronLeft size={26} />
                </button>
                <button
                  className="gallery-lightbox-next-all absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-[#0075ff] text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md transition-all cursor-pointer hover:scale-110"
                  aria-label={t("gallery.nextPhoto")}
                >
                  <FiChevronRight size={26} />
                </button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div
              className="p-3 sm:p-5 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 sm:gap-3 justify-center min-w-max mx-auto">
                {photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => swiperRef.current?.slideToLoop(i)}
                    className={`shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${
                      i === photoIndex
                        ? "ring-2 ring-[#0075ff] ring-offset-2 ring-offset-[#051229] scale-105"
                        : "opacity-50 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img src={src} alt={`Thumb ${i + 1}`} className="w-14 h-14 sm:w-20 sm:h-20 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default AllGallery;
