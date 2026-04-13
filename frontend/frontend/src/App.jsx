import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// public site components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import AppDetail from "./pages/AppDetail";
import ClientDetail from "./pages/ClientDetail";
import NotFound from "./pages/NotFound";
import AdminNotFound from "./admin/AdminNotFound";

// home wrapper — refresh always lands at the top of the page
// (we no longer auto-scroll to a section based on the URL path; the user wants
//  refresh to behave like "go to home")
function HomeWithScroll() {
  useEffect(() => {
    // normalize URL back to "/" if user landed on /apps, /team, etc.
    if (window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
    window.scrollTo(0, 0);
  }, []);

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
import AdminProjectDetail from "./admin/ProjectDetail";
import AdminAppDetail from "./admin/AppDetail";
import AdminClientDetail from "./admin/ClientDetail";

// shared layout for all public pages - navbar on top, footer at bottom
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
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
          <Route path="*" element={<AdminNotFound />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
