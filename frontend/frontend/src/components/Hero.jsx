import { useState, useEffect } from "react";
import { getHero } from "../api";
import shopifyBadge from "../assets/shopify-partners.png";
import wooBadge from "../assets/woocommerce.png";

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
      <div className="flex flex-col md:flex-row h-[88vh]">

        {/* left side — image (60%) */}
        <div className="w-full md:w-[60%] relative overflow-hidden">
          <img
            src={data.backgroundImage}
            alt={data.title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* right side — text + button (40%) */}
        <div className="w-full md:w-[40%] flex items-center px-6 sm:px-10 lg:px-12 py-8 md:py-0">
          <div>
            <h1 className="hero-title text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-1 leading-snug">
              {data.title}
            </h1>
            <p className="hero-subtitle text-base sm:text-lg text-gray-700 mb-3">
              {data.subtitle}
            </p>

            {/* partner badges */}
            <div className="flex items-center gap-4 mb-4">
              <img src={data.badgeImage1 || shopifyBadge} alt="Shopify Partners" className="h-12 object-contain" />
              <img src={data.badgeImage2 || wooBadge} alt="WooCommerce" className="h-12 object-contain" />
            </div>

            <a
              href={data.buttonLink}
              className="hero-button inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-2.5 rounded-lg transition-all text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {data.buttonText}
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;
