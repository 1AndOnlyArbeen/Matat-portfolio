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
          <div className="w-full md:flex-1 order-1 md:order-1">
            <h1 className="hero-title text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-5 leading-tight">
              {data.title}
            </h1>
            <p className="hero-subtitle text-sm sm:text-base md:text-lg text-gray-700 mb-8 sm:mb-10">
              {data.subtitle}
            </p>

            {/* partner badges — placed above the button */}
            {(data.badgeImage1 || data.badgeImage2) && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
                {data.badgeImage1 && (
                  <img src={data.badgeImage1} alt="Badge 1" className="h-9 sm:h-11 object-contain" />
                )}
                {data.badgeImage2 && (
                  <img src={data.badgeImage2} alt="Badge 2" className="h-9 sm:h-11 object-contain" />
                )}
              </div>
            )}

            <a
              href={data.buttonLink}
              className="hero-button inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all text-sm sm:text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
