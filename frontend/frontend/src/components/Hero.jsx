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
    <section
      id="hero"
      className="relative min-h-[75vh] flex items-center overflow-hidden"
    >
      {/* background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${data.backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* subtle floating shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }}></div>

      {/* hero content — left aligned */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-16 max-w-3xl">
        <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          {data.title}
        </h1>
        <p className="hero-subtitle text-base sm:text-lg text-gray-200 mb-6 max-w-xl">
          {data.subtitle}
        </p>
        <a
          href={data.buttonLink}
          className="hero-button inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-2.5 rounded-lg transition-all text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {data.buttonText}
        </a>
      </div>

      {/* scroll down indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full" style={{ animation: "heroPulse 2s ease-in-out infinite" }}></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
