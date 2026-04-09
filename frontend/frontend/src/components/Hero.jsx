import { useState, useEffect } from "react";
import { getHero } from "../api";

function Hero() {
  const [data, setData] = useState(null);

  // fetch active hero from backend
  useEffect(() => {
    getHero().then((res) => {
      if (res && res.title) setData(res);
    });
  }, []);

  // no active banner — show nothing
  if (!data) return null;

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* background image with dark overlay so text stays readable */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${data.backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* subtle floating shapes for depth */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }}></div>

      {/* hero content - staggered entrance animation */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {data.title}
        </h1>
        <p className="hero-subtitle text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          {data.subtitle}
        </p>
        <a
          href={data.buttonLink}
          className="hero-button inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {data.buttonText}
        </a>
      </div>

      {/* scroll down indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full" style={{ animation: "heroPulse 2s ease-in-out infinite" }}></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
