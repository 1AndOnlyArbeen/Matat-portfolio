import { useState, useEffect, useRef } from "react";
import { getGallery } from "../api";
import { FiX, FiChevronLeft, FiChevronRight, FiMapPin, FiCalendar, FiImage, FiArrowUpRight, FiTag } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// modern gallery — masonry-ish grid of album cards with stacked photo previews
function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [openAlbum, setOpenAlbum] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation(0.05);
  const swiperRef = useRef(null);

  useEffect(() => {
    getGallery().then((res) => {
      if (res && res.length > 0) setAlbums(res);
    });
  }, []);

  const open = (album) => {
    setOpenAlbum(album);
    setPhotoIndex(0);
  };

  const close = () => setOpenAlbum(null);

  // Escape key closes the lightbox
  useEffect(() => {
    if (!openAlbum) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openAlbum]);

  // images may come as [{url, publicId}] objects from the backend OR as plain
  // string URLs in older docs. Normalize to a flat array of strings either way.
  const toUrl = (i) => (typeof i === "string" ? i : i?.url);
  const photos = openAlbum?.images?.length
    ? openAlbum.images.map(toUrl).filter(Boolean)
    : openAlbum?.thumbnail
    ? [openAlbum.thumbnail]
    : openAlbum?.image
    ? [openAlbum.image]
    : [];

  // hide the section entirely if no albums returned from backend
  if (albums.length === 0) return null;

  return (
    <section id="gallery" className="relative py-20 sm:py-28 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* decorative blurred blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div ref={headingRef} className={`text-center mb-14 sm:mb-16 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <p className="inline-block text-xs sm:text-sm font-semibold tracking-[0.25em] text-blue-600 uppercase mb-3">
            ✦ Our Story In Photos
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-950 mb-4 leading-tight">
            Memories from <span className="text-blue-600">the road</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base sm:text-lg">
            Glimpses of moments — events, trips, milestones — across the places we've been.
          </p>
        </div>

        {/* album grid — mixed sizes for visual rhythm */}
        <div
          ref={gridRef}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-fade-up ${gridVisible ? "visible" : ""}`}
        >
          {albums.map((album, idx) => {
            const count = album.images?.length || 1;
            // make every 5th card span 2 columns on large screens for visual interest
            const isWide = idx % 5 === 0;
            return (
              <button
                key={album._id}
                onClick={() => open(album)}
                className={`group relative text-left cursor-pointer rounded-3xl overflow-hidden bg-white shadow-[0_10px_40px_rgba(30,64,175,0.12)] hover:shadow-[0_20px_50px_rgba(30,64,175,0.28)] hover:-translate-y-1 transition-all duration-500 ${
                  isWide ? "lg:col-span-2" : ""
                }`}
              >
                {/* stacked photo deck preview */}
                <div className={`relative ${isWide ? "aspect-[16/9]" : "aspect-[4/3]"} overflow-hidden bg-blue-100`}>
                  {/* normalize each image — supports both {url, publicId} objects and plain strings */}
                  {(() => {
                    const imgs = (album.images || []).map(toUrl).filter(Boolean);
                    const cover = album.thumbnail || album.image || imgs[0];
                    return (
                      <>
                        {/* back layers — peeking from behind */}
                        {imgs[2] && (
                          <img
                            src={imgs[2]}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 w-full h-full object-cover scale-95 -rotate-2 opacity-40 blur-sm"
                          />
                        )}
                        {imgs[1] && (
                          <img
                            src={imgs[1]}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 w-full h-full object-cover scale-[0.98] rotate-1 opacity-60"
                          />
                        )}
                        {/* main cover — prefer thumbnail uploaded in admin, fall back to first photo */}
                        {cover && (
                          <img
                            src={cover}
                            alt={album.place}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />
                        )}
                      </>
                    );
                  })()}

                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/85 via-blue-950/20 to-transparent" />

                  {/* top row — flex layout; tag lives here ONLY on small cards */}
                  <div className="absolute top-3 left-3 right-3 flex items-start gap-2">
                    {/* hover arrow — fixed 28px on the left */}
                    <div className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-blue-700 shadow-md opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shrink-0">
                      <FiArrowUpRight size={14} />
                    </div>

                    {/* tag sits in the middle on SMALL cards; empty spacer on wide cards (tag goes to bottom there) */}
                    {!isWide && album.caption ? (
                      <div className="flex-1 min-w-0 flex justify-center">
                        <div className="bg-blue-600/95 backdrop-blur-sm text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-lg inline-flex items-center gap-1 max-w-full">
                          <FiTag size={11} className="shrink-0" />
                          <span className="truncate">{album.caption}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1" />
                    )}

                    {/* photo count — fixed-width on the right */}
                    <div className="bg-white/95 backdrop-blur-md text-blue-700 text-[11px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 shadow-md shrink-0">
                      <FiImage size={11} />
                      {count}
                    </div>
                  </div>

                  {/* bottom area */}
                  {/* WIDE card → date+place on one row, tag centered below them */}
                  {isWide ? (
                    <>
                      {(album.date || album.place) && (
                        <div className="absolute bottom-14 left-4 right-4 flex items-end justify-between gap-2">
                          {album.date ? (
                            <p className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-white inline-flex items-center gap-1 drop-shadow-md min-w-0 flex-1 truncate">
                              <FiCalendar size={13} className="shrink-0" />
                              <span className="truncate">
                                {new Date(album.date).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </p>
                          ) : (
                            <span className="flex-1" />
                          )}
                          {album.place && (
                            <p className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-white inline-flex items-center gap-1 drop-shadow-md min-w-0 flex-1 truncate justify-end text-right">
                              <FiMapPin size={13} className="text-blue-300 shrink-0" />
                              <span className="truncate">{album.place}</span>
                            </p>
                          )}
                        </div>
                      )}
                      {album.caption && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600/95 backdrop-blur-sm text-white text-sm font-bold px-5 py-1.5 rounded-full shadow-lg inline-flex items-center gap-1.5 max-w-[85%]">
                          <FiTag size={13} className="shrink-0" />
                          <span className="truncate">{album.caption}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    /* SMALL card → tag already on top; just date+place in one bottom row */
                    (album.date || album.place) && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                        {album.date ? (
                          <p className="text-[10px] sm:text-xs font-extrabold tracking-wide uppercase text-white inline-flex items-center gap-1 drop-shadow-md min-w-0 flex-1 truncate">
                            <FiCalendar size={12} className="shrink-0" />
                            <span className="truncate">
                              {new Date(album.date).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </p>
                        ) : (
                          <span className="flex-1" />
                        )}
                        {album.place && (
                          <p className="text-[10px] sm:text-xs font-extrabold tracking-wide uppercase text-white inline-flex items-center gap-1 drop-shadow-md min-w-0 flex-1 truncate justify-end text-right">
                            <FiMapPin size={12} className="text-blue-300 shrink-0" />
                            <span className="truncate">{album.place}</span>
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* lightbox */}
      {openAlbum && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col backdrop-blur-md animate-zoom-in visible"
          onClick={close}
        >
          {/* top bar */}
          <div
            className="flex items-start justify-between p-4 sm:p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold tracking-widest text-blue-300 uppercase mb-1 inline-flex items-center gap-1.5">
                {openAlbum.date && (
                  <>
                    <FiCalendar size={12} />
                    {new Date(openAlbum.date).toLocaleDateString(undefined, {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </>
                )}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold inline-flex items-center gap-2 truncate">
                <FiMapPin size={20} className="text-blue-300 shrink-0" />
                <span className="truncate">{openAlbum.place || openAlbum.caption}</span>
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mt-1 inline-flex items-center gap-1.5">
                <FiImage size={12} /> {photoIndex + 1} of {photos.length}
              </p>
            </div>
            <button
              onClick={close}
              className="text-white/70 hover:text-white hover:rotate-90 cursor-pointer transition-all p-2"
            >
              <FiX size={28} />
            </button>
          </div>

          {/* big photo — Swiper slider with smooth fade transitions */}
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
                prevEl: ".gallery-lightbox-prev",
                nextEl: ".gallery-lightbox-next",
              }}
              loop={photos.length > 1}
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={(s) => setPhotoIndex(s.realIndex)}
              className="w-full h-full"
            >
              {photos.map((src, i) => (
                <SwiperSlide key={i} className="!flex items-center justify-center px-4 sm:px-16">
                  {/* fixed-aspect frame so every photo (portrait/landscape/square) lays out the same */}
                  <div className="w-full h-full max-h-[75vh] flex items-center justify-center">
                    <img
                      src={src}
                      alt={`${openAlbum.place || openAlbum.caption} photo ${i + 1}`}
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
                  className="gallery-lightbox-prev absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md transition-all cursor-pointer hover:scale-110"
                  aria-label="Previous photo"
                >
                  <FiChevronLeft size={26} />
                </button>
                <button
                  className="gallery-lightbox-next absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md transition-all cursor-pointer hover:scale-110"
                  aria-label="Next photo"
                >
                  <FiChevronRight size={26} />
                </button>
              </>
            )}
          </div>

          {/* thumbnail strip — clicking any thumb syncs with the swiper */}
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
                        ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-black scale-105"
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

export default Gallery;
