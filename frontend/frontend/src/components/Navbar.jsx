import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/matat-logo-new1.svg";

// nav links - each maps to a section id on the homepage
const navLinks = [
  { name: "Home", path: "/", section: "hero" },
  { name: "Projects", path: "/projects", section: "projects" },
  { name: "Apps", path: "/apps", section: "apps" },
  { name: "About", path: "/about", section: "about" },
  { name: "Team", path: "/team", section: "team" },
  { name: "Gallery", path: "/gallery", section: "gallery" },
  { name: "Contact", path: "/contact", section: "contact" },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero"); // tracks which section is in view
  const navigate = useNavigate();
  const location = useLocation();

  // if we are on a detail page like /projects/1, figure out which nav should be active
  const getActiveFromPath = useCallback(() => {
    const path = location.pathname;
    if (path.startsWith("/projects/")) return "projects";
    if (path.startsWith("/apps/")) return "apps";
    if (path.startsWith("/clients/")) return "clients";
    return null;
  }, [location.pathname]);

  // track scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // observe which section is currently visible on the homepage
  // this makes the nav link highlight as you scroll through sections
  // and updates the URL to match the current section
  useEffect(() => {
    // only run observer on homepage-like paths
    const homePaths = ["/", ...navLinks.map((l) => l.path)];
    if (!homePaths.includes(location.pathname)) return;

    const sectionIds = navLinks.map((l) => l.section);
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          // when section enters viewport, mark it as active and update URL
          if (entry.isIntersecting) {
            setActiveSection(id);
            const link = navLinks.find((l) => l.section === id);
            if (link) {
              window.history.replaceState(null, "", link.path);
            }
          }
        },
        { rootMargin: "-40% 0px -40% 0px" } // trigger when section is near center of screen
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [location.pathname]);

  // smooth scroll to section when clicking nav link
  const handleNavClick = (e, link) => {
    e.preventDefault();
    setMobileOpen(false);

    const homePaths = ["/", ...navLinks.map((l) => l.path)];

    // if on a detail page (not a section path), navigate to home first then scroll
    if (!homePaths.includes(location.pathname)) {
      navigate(link.path);
      return;
    }

    // on homepage, just scroll to the section and update URL
    if (link.section === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(link.section);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    window.history.replaceState(null, "", link.path);
  };

  // figure out if a nav link is the "active" one
  const isActive = (link) => {
    // on detail pages, match by path prefix
    const pathActive = getActiveFromPath();
    if (pathActive) return link.section === pathActive;

    // on homepage, match by scroll position
    return activeSection === link.section;
  };

  return (
    <nav
      className={`bg-white/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-[0_6px_30px_rgba(37,99,235,0.35)]" : "shadow-[0_4px_20px_rgba(37,99,235,0.2)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* logo - click goes to home and scrolls to top */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <img src={logo} alt="Matat" className="h-9 sm:h-10 w-auto" />
          </a>

          {/* desktop nav links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link)
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* mobile hamburger toggle */}
          <button
            className="md:hidden text-gray-700 focus:outline-none cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* mobile dropdown menu - slides open/close */}
      <div
        className={`md:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive(link)
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
