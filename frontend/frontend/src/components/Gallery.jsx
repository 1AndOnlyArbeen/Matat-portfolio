import { useState, useEffect } from "react";
import { getGallery } from "../api";
import { galleryData as fallback } from "../data/placeholders";
import { FiX, FiChevronLeft, FiChevronRight, FiMapPin, FiCalendar, FiImage, FiArrowUpRight } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

// modern gallery — masonry-ish grid of album cards with stacked photo previews
function Gallery() {
  const [albums, setAlbums] = useState(fallback);
  const [openAlbum, setOpenAlbum] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [headingRef, headingVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation(0.05);

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

  const photos = openAlbum?.images?.length
    ? openAlbum.images
    : openAlbum
    ? [openAlbum.image]
    : [];

  const prev = () => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setPhotoIndex((i) => (i + 1) % photos.length);

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
                  {/* back layers — peeking from behind */}
                  {album.images?.[2] && (
                    <img
                      src={album.images[2]}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover scale-95 -rotate-2 opacity-40 blur-sm"
                    />
                  )}
                  {album.images?.[1] && (
                    <img
                      src={album.images[1]}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover scale-[0.98] rotate-1 opacity-60"
                    />
                  )}
                  {/* main cover — prefer thumbnail uploaded in admin, fall back to first photo */}
                  <img
                    src={album.thumbnail || album.image || album.images?.[0]}
                    alt={album.place}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* gradient + count badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/85 via-blue-950/20 to-transparent" />

                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-md">
                    <FiImage size={13} />
                    {count} photo{count > 1 ? "s" : ""}
                  </div>

                  {/* hover arrow indicator */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-blue-700 shadow-md opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <FiArrowUpRight size={18} />
                  </div>

                  {/* place + date overlaid on the image */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                    {album.date && (
                      <p className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-blue-200 mb-1.5 inline-flex items-center gap-1.5">
                        <FiCalendar size={12} />
                        {new Date(album.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                    <h3 className="text-xl sm:text-2xl font-bold leading-snug inline-flex items-center gap-2">
                      <FiMapPin size={18} className="text-blue-300 shrink-0" />
                      <span className="truncate">{album.place || album.caption}</span>
                    </h3>
                    {album.caption && album.place && (
                      <p className="text-sm text-white/80 mt-1 line-clamp-1">{album.caption}</p>
                    )}
                  </div>
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

          {/* big photo */}
          <div
            className="flex-1 relative flex items-center justify-center px-4 sm:px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[photoIndex]}
              alt={`${openAlbum.place} photo ${photoIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
            />

            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md transition-all cursor-pointer hover:scale-110"
                >
                  <FiChevronLeft size={26} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 sm:p-4 backdrop-blur-md transition-all cursor-pointer hover:scale-110"
                >
                  <FiChevronRight size={26} />
                </button>
              </>
            )}
          </div>

          {/* thumbnail strip */}
          {photos.length > 1 && (
            <div
              className="p-3 sm:p-5 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 sm:gap-3 justify-center min-w-max mx-auto">
                {photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
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
