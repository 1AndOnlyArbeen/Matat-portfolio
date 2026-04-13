import { useState, useEffect } from "react";
import { getHero } from "../api";

function Hero() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getHero().then((res) => {
      if (res && res.title) setData(res);
    });
  }, []);

  if (!data) return null;

  return (
    <section id="hero" className="bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-12 pt-24 sm:pt-28 md:pt-28 pb-8 sm:pb-12 md:pb-16">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">

          {/* LEFT — text + button (TOP on mobile, LEFT on desktop) */}
          <div className="w-full md:flex-1 order-1 md:order-1 text-center md:text-left">
            {/* serif title — Times New Roman family, dark navy, elegant spacing */}
            <h1
              className="hero-title font-extrabold text-gray-900 mb-3 sm:mb-4 leading-[0.95] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ fontFamily: '"Times New Roman", Times, "Playfair Display", serif' }}
            >
              {data.title}
            </h1>

            {/* subtitle — same serif family, lighter weight, softer color */}
            <p
              className="hero-subtitle text-base sm:text-lg md:text-xl text-gray-700 mb-8 sm:mb-10 italic leading-relaxed max-w-xl mx-auto md:mx-0"
              style={{ fontFamily: '"Times New Roman", Times, "Playfair Display", serif' }}
            >
              {data.subtitle}
            </p>

            {/* partner badges — placed above the button */}
            {(data.badgeImage1 || data.badgeImage2) && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 mb-10 sm:mb-12">
                {data.badgeImage1 && (
                  <img src={data.badgeImage1} alt="Badge 1" className="h-9 sm:h-11 object-contain" />
                )}
                {data.badgeImage2 && (
                  <img src={data.badgeImage2} alt="Badge 2" className="h-9 sm:h-11 object-contain" />
                )}
              </div>
            )}

            {/* CTA button — still sans-serif for contrast and legibility */}
            <a
              href={data.buttonLink}
              className="hero-button inline-block bg-blue-700 hover:bg-blue-600 text-white font-semibold px-8 sm:px-10 py-5 sm:py-6 rounded-xl transition-all text-base sm:text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 tracking-wide"
            >
              {data.buttonText}
            </a>
          </div>

          {/* RIGHT — banner image (BOTTOM on mobile, RIGHT on desktop) */}
          <div className="w-3/4 sm:w-2/3 md:w-[34rem] lg:w-[38rem] shrink-0 order-2 md:order-2 mx-auto md:mx-0">
            <img
              src={data.backgroundImage}
              alt={data.title}
              draggable="false"
              className="block w-full h-auto object-cover select-none"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, black 55%, transparent 95%)",
                maskImage:
                  "radial-gradient(ellipse at center, black 55%, transparent 95%)",
              }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;
