import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoWhite from "../assets/matat-logo-white.svg";
import logoDark from "../assets/matat-logo-new1.svg";
import LanguageToggle from "./LanguageToggle";

// "page: true" = navigate to a dedicated /all page; otherwise scroll to the section on home
const navLinks = [
  { nameKey: "nav.home", path: "/", section: "hero" },
  { nameKey: "nav.projects", path: "/projects/all", section: "projects", page: true },
  { nameKey: "nav.apps", path: "/apps/all", section: "apps", page: true },
  { nameKey: "nav.clients", path: "/clients/all", section: "clients", page: true },
  { nameKey: "nav.about", path: "/about/all", section: "about", page: true },
  { nameKey: "nav.team", path: "/team/all", section: "team", page: true },
  { nameKey: "nav.testimonials", path: "/testimonials/all", section: "testimonials", page: true },
  { nameKey: "nav.gallery", path: "/gallery/all", section: "gallery", page: true },
  { nameKey: "nav.contact", path: "/contact", section: "contact" },
];

function Navbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    const match = navLinks.find((l) => l.path === window.location.pathname);
    return match ? match.section : "hero";
  });
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveFromPath = useCallback(() => {
    const path = location.pathname;
    if (path.startsWith("/projects/")) return "projects";
    if (path.startsWith("/apps/")) return "apps";
    if (path.startsWith("/clients/")) return "clients";
    return null;
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (window.scrollY < 200) {
        setActiveSection("hero");
        if (window.location.pathname !== "/") {
          window.history.replaceState(null, "", "/");
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const homePaths = ["/", ...navLinks.map((l) => l.path)];
    if (!homePaths.includes(location.pathname)) return;

    const sectionIds = navLinks.map((l) => l.section);
    const ioMap = new Map();

    const handleIntersect = (id) => ([entry]) => {
      if (!entry.isIntersecting) return;
      if (window.scrollY < 200 && id !== "hero") return;
      setActiveSection(id);
      const link = navLinks.find((l) => l.section === id);
      if (link && window.location.pathname !== link.path) {
        window.history.replaceState(null, "", link.path);
      }
    };

    const tryObserve = (id) => {
      if (ioMap.has(id)) return;
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(handleIntersect(id), {
        rootMargin: "-30% 0px -50% 0px",
      });
      io.observe(el);
      ioMap.set(id, io);
    };

    sectionIds.forEach(tryObserve);

    const mo = new MutationObserver(() => {
      sectionIds.forEach(tryObserve);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      ioMap.forEach((io) => io.disconnect());
    };
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (e, link) => {
    e.preventDefault();
    setMobileOpen(false);

    // dedicated /all pages — navigate, don't scroll
    if (link.page) {
      navigate(link.path);
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    // home / contact — if we're not already on the home, navigate first
    if (location.pathname !== "/") {
      navigate("/");
      // wait for the home to mount then scroll
      setTimeout(() => {
        if (link.section === "hero") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          document.getElementById(link.section)?.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
      return;
    }

    setActiveSection(link.section);
    if (link.section === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(link.section);
      if (el) {
        const offset = 80;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  const isActive = (link) => {
    const pathActive = getActiveFromPath();
    if (pathActive) return link.section === pathActive;
    return activeSection === link.section;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 overflow-hidden transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)]"
            : "backdrop-blur-2xl"
        }`}
      >
        {/* animated bubble — light, covers logo area */}
        <div className="absolute -left-10 -top-10 w-[350px] h-[120px] bg-[#e8f0fe]/70 rounded-full blur-2xl animate-pulse-glow pointer-events-none" />
        {/* animated bubble — darker, covers nav links area */}
        <div className="absolute -right-10 -top-6 w-[600px] h-[100px] bg-[#c4d7f5]/60 rounded-full blur-2xl pointer-events-none" style={{ animation: "pulse-glow 5s ease-in-out infinite 1s" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-20">
            {/* logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <img
                src={logoDark}
                alt="Matat"
                className="h-10 sm:h-12 w-auto transition-all duration-300"
              />
            </a>

            {/* desktop nav links — on the blue area, white text */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.nameKey}
                  href={link.path}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`relative px-3 py-2 text-[15px] font-bold transition-colors ${
                    isActive(link)
                      ? "text-[#5B7BF7]"
                      : "text-[#364052] hover:text-[#5B7BF7]"
                  }`}
                >
                  {t(link.nameKey)}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#5B7BF7] rounded-full transition-all duration-300 ${
                      isActive(link) ? "w-full" : "w-0"
                    }`}
                  />
                </a>
              ))}
              <LanguageToggle className="ms-3" scrolled={scrolled} />
            </div>

            {/* hamburger toggle */}
            <button
              className="lg:hidden focus:outline-none cursor-pointer text-[#051229]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <div className={`menu-bar ${mobileOpen ? "active" : ""}`}>
                <span />
                <span />
                <span />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* mobile slide-in panel */}
      <div className={`hamburger-overlay ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />
      <div className={`hamburger-panel ${mobileOpen ? "open" : ""}`}>
        <div className="px-6 sm:px-8 pt-4 pb-6">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setMobileOpen(false)}
              className="text-[#051229]/70 hover:text-[#051229] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="space-y-0">
            {navLinks.map((link) => (
              <a
                key={link.nameKey}
                href={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`block py-4 text-[16px] font-bold border-b border-black/10 transition-colors ${
                  isActive(link)
                    ? "text-[#0075ff]"
                    : "text-[#051229] hover:text-[#0075ff]"
                }`}
              >
                {t(link.nameKey)}
              </a>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-black/10">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
