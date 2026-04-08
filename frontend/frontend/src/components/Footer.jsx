import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import logo from "../assets/matat-logo-new1.svg";

// site footer with brand info, quick links, and contact details
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* brand column */}
          <div>
            {/* logo in a white rounded box so it shows original colors on dark bg */}
            <div className="inline-block bg-white rounded-lg px-4 py-2 mb-4">
              <img src={logo} alt="Matat" className="h-8 w-auto" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Building modern digital experiences for businesses worldwide. We turn ideas into reality.
            </p>
            {/* social links */}
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-blue-400 transition-colors hover:-translate-y-0.5 inline-block"><FiGithub size={20} /></a>
              <a href="#" className="hover:text-blue-400 transition-colors hover:-translate-y-0.5 inline-block"><FiLinkedin size={20} /></a>
              <a href="#" className="hover:text-blue-400 transition-colors hover:-translate-y-0.5 inline-block"><FiTwitter size={20} /></a>
            </div>
          </div>

          {/* quick links column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#projects" className="hover:text-blue-400 transition-colors">Projects</a></li>
              <li><a href="#apps" className="hover:text-blue-400 transition-colors">Apps</a></li>
              <li><a href="#about" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#team" className="hover:text-blue-400 transition-colors">Team</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* contact info column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <FiMapPin className="text-blue-400 shrink-0" />
                <span>Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="text-blue-400 shrink-0" />
                <span>hello@portfolio.com</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="text-blue-400 shrink-0" />
                <span>+977 9800000000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* copyright */}
        <div className="border-t border-blue-900 mt-10 pt-6 text-center text-sm text-gray-500">
          &copy; {currentYear} Matat. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
