import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import logo from "../assets/matat-logo-new1.svg";

// site footer with brand info, quick links, and contact details
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="backdrop-blur-sm bg-blue-100 text-blue-900 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-8">
          <img src={logo} alt="Matat" className="h-5 w-auto" />

          <nav className="flex flex-wrap justify-center items-center gap-x-5 gap-y-1 text-sm text-blue-900">
            <a href="#projects" className="hover:text-blue-600 transition-colors">Projects</a>
            <a href="#apps" className="hover:text-blue-600 transition-colors">Apps</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <a href="#team" className="hover:text-blue-600 transition-colors">Team</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </nav>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-5 text-sm text-blue-900">
            <span className="flex items-center gap-1.5"><FiMapPin className="text-blue-900" size={14} /> Kathmandu, Nepal</span>
            <span className="flex items-center gap-1.5"><FiMail className="text-blue-900" size={14} /> hello@portfolio.com</span>
          </div>

          <div className="flex items-center gap-3">
            <a href="#" className="text-blue-900 hover:text-blue-600 transition-colors"><FiGithub size={16} /></a>
            <a href="#" className="text-blue-900 hover:text-blue-600 transition-colors"><FiLinkedin size={16} /></a>
            <a href="#" className="text-blue-900 hover:text-blue-600 transition-colors"><FiTwitter size={16} /></a>
          </div>
        </div>

        <div className="border-t border-blue-200 mt-4 pt-3 text-center text-xs text-blue-900/60">
          &copy; {currentYear} Matat. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
