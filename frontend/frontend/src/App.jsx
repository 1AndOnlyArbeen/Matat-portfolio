import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

// public site components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import Preloader from "./components/Preloader";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import AppDetail from "./pages/AppDetail";
import ClientDetail from "./pages/ClientDetail";
import NotFound from "./pages/NotFound";
import AdminNotFound from "./admin/AdminNotFound";

// maps section paths to their DOM element IDs so we can scroll to them
const sectionMap = {
  "/projects":      "projects",
  "/apps":          "apps",
  "/clients":       "clients",
  "/about":         "about",
  "/team":          "team",
  "/testimonials":  "testimonials",
  "/gallery":       "gallery",
  "/contact":       "contact",
};

// home wrapper — on mount, scrolls to the section that matches the current URL
// so that /projects lands in the Projects section, /apps in Apps, etc.
// Landing on "/" just scrolls to the top.
function HomeWithScroll() {
  const location = useLocation();

  useEffect(() => {
    const sectionId = sectionMap[location.pathname];
    if (!sectionId) {
      window.scrollTo(0, 0);
      return;
    }
    // retry until the section exists (async data may delay render)
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        const offset = 80;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      } else if (attempts < 20) {
        attempts++;
        setTimeout(tryScroll, 200);
      }
    };
    setTimeout(tryScroll, 300);
  }, [location.pathname]);

  return <Home />;
}

// admin panel components
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/Dashboard";
import ManageHero from "./admin/ManageHero";
import ManageProjects from "./admin/ManageProjects";
import ManageApps from "./admin/ManageApps";
import ManageClients from "./admin/ManageClients";
import ManageTeam from "./admin/ManageTeam";
import ManageTestimonials from "./admin/ManageTestimonials";
import ManageGallery from "./admin/ManageGallery";
import ManageAbout from "./admin/ManageAbout";
import ManageMessages from "./admin/ManageMessages";
import ManageFooter from "./admin/ManageFooter";
import AdminProjectDetail from "./admin/ProjectDetail";
import AdminAppDetail from "./admin/AppDetail";
import AdminClientDetail from "./admin/ClientDetail";

// On hard refresh / first load, redirect any public route back to "/"
// so the user always lands on the home page. Admin routes are excluded.
function RedirectHomeOnLoad() {
  const location = useLocation();

  useEffect(() => {
    // skip admin routes
    if (location.pathname.startsWith("/matat-admin")) return;
    // if not already on "/", replace the URL to home
    if (location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — runs only once on mount (i.e. hard refresh)

  return null;
}

// shared layout for all public pages - navbar on top, footer at bottom
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RedirectHomeOnLoad />
      <Preloader />
      <CustomCursor />
      <Routes>

        {/* ===== PUBLIC SITE ROUTES ===== */}

        {/* home page and section routes */}
        <Route path="/" element={<PublicLayout><HomeWithScroll /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><HomeWithScroll /></PublicLayout>} />
        <Route path="/apps" element={<PublicLayout><HomeWithScroll /></PublicLayout>} />
        <Route path="/clients" element={<PublicLayout><HomeWithScroll /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><HomeWithScroll /></PublicLayout>} />
        <Route path="/team" element={<PublicLayout><HomeWithScroll /></PublicLayout>} />
        <Route path="/testimonials" element={<PublicLayout><HomeWithScroll /></PublicLayout>} />
        <Route path="/gallery" element={<PublicLayout><HomeWithScroll /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><HomeWithScroll /></PublicLayout>} />

        {/* detail pages - project, app, client */}
        <Route path="/projects/:id" element={<PublicLayout><ProjectDetail /></PublicLayout>} />
        <Route path="/apps/:id" element={<PublicLayout><AppDetail /></PublicLayout>} />
        <Route path="/clients/:id" element={<PublicLayout><ClientDetail /></PublicLayout>} />

        {/* ===== ADMIN PANEL ROUTES ===== */}

        {/* admin login - standalone page, no sidebar */}
        <Route path="/matat-admin/login" element={<AdminLogin />} />

        {/* admin pages - nested inside AdminLayout (has sidebar) */}
        <Route path="/matat-admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="hero" element={<ManageHero />} />
          <Route path="projects" element={<ManageProjects />} />
          <Route path="projects/:id" element={<AdminProjectDetail />} />
          <Route path="apps" element={<ManageApps />} />
          <Route path="apps/:id" element={<AdminAppDetail />} />
          <Route path="clients" element={<ManageClients />} />
          <Route path="clients/:id" element={<AdminClientDetail />} />
          <Route path="team" element={<ManageTeam />} />
          <Route path="testimonials" element={<ManageTestimonials />} />
          <Route path="gallery" element={<ManageGallery />} />
          <Route path="about" element={<ManageAbout />} />
          <Route path="messages" element={<ManageMessages />} />
          <Route path="footer" element={<ManageFooter />} />
          <Route path="*" element={<AdminNotFound />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
