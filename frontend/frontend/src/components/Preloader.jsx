import { useState, useEffect } from "react";

function Preloader() {
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // hide the inline HTML preloader
    const htmlPreloader = document.getElementById("preloader");
    if (htmlPreloader) htmlPreloader.style.display = "none";

    // show React preloader briefly, then fade out
    const timer = setTimeout(() => setLoaded(true), 800);
    const hideTimer = setTimeout(() => setHidden(true), 1400);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className={`preloader ${loaded ? "loaded" : ""}`}>
      <div className="loading" />
    </div>
  );
}

export default Preloader;
