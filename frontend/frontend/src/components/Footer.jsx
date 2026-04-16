import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiGithub, FiLinkedin, FiTwitter, FiFacebook, FiInstagram } from "react-icons/fi";
import { getFooterSettings } from "../api";
import useLang from "../hooks/useLang";
import footerLogo from "../assets/matat.footer.svg";

function Footer() {
  const { t } = useTranslation();
  const l = useLang();
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState(null);

  useEffect(() => {
    getFooterSettings().then((res) => {
      if (res) setData(res);
    });
  }, []);

  const tagline   = (data && l(data, "tagline"))   || t("footer.developed");
  const email     = data?.email                     || t("footer.email");
  const phone     = data?.phone                     || t("contact.phoneValue");
  const location  = (data && l(data, "location"))   || t("footer.location");
  const copyright = (data && l(data, "copyright"))  || t("footer.rights");

  const socials = [
    { icon: FiGithub,   url: data?.githubUrl },
    { icon: FiLinkedin,  url: data?.linkedinUrl },
    { icon: FiTwitter,   url: data?.twitterUrl },
  ].filter((s) => s.url);

  return (
    <footer style={{ background: "#ffffff", marginTop: 0, paddingTop: 0 }}>
      {/* arch — smooth gentle curve */}
<div style={{ width: "100%", lineHeight: 0, overflow: "hidden" }}>
  <svg
    viewBox="0 0 1440 90"
    preserveAspectRatio="none"
    style={{ width: "100%", height: "90px", display: "block" }}
  >
    <path
      d="M0,80 C360,0 1080,0 1440,80 C1080,6 360,6 0,80 Z"
      fill="#3B5BDB"
    />
  </svg>
</div>

      {/* footer content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 pt-3 pb-2 flex flex-col lg:flex-row gap-6">

        {/* left 50% — logo + tagline */}
        <div className="lg:w-1/2 flex items-start gap-4">
          <img src={footerLogo} alt="Matat" className="h-12 w-auto shrink-0" />
          <div>
            <p className="text-base font-bold text-[#051229] mb-1">Matat Technology</p>
            <p className="text-sm leading-snug text-[#7e8590] max-w-[280px]">{tagline}</p>
          </div>
        </div>

        {/* right 50% — links + contact in 3 cols */}
        <div className="lg:w-1/2 grid grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#051229] mb-2">{t("nav.home")}</h4>
            <ul className="space-y-1">
              {[
                { label: t("nav.projects"), href: "#projects" },
                { label: t("nav.apps"), href: "#apps" },
                { label: t("nav.clients"), href: "#clients" },
                { label: t("nav.about"), href: "#about" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[#7e8590] hover:text-[#0075ff] transition-colors text-sm">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#051229] mb-2">{t("nav.gallery")}</h4>
            <ul className="space-y-1">
              {[
                { label: t("nav.team"), href: "#team" },
                { label: t("nav.testimonials"), href: "#testimonials" },
                { label: t("nav.gallery"), href: "#gallery" },
                { label: t("nav.contact"), href: "#contact" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[#7e8590] hover:text-[#0075ff] transition-colors text-sm">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#051229] mb-3">Follow Us</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: FiFacebook, url: data?.facebookUrl || "#", bg: "bg-[#1877F2]" },
                { icon: FiInstagram, url: data?.instagramUrl || "#", bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]" },
                ...(data?.linkedinUrl ? [{ icon: FiLinkedin, url: data.linkedinUrl, bg: "bg-[#0A66C2]" }] : []),
                ...(data?.twitterUrl ? [{ icon: FiTwitter, url: data.twitterUrl, bg: "bg-[#1DA1F2]" }] : []),
                ...(data?.githubUrl ? [{ icon: FiGithub, url: data.githubUrl, bg: "bg-[#333]" }] : []),
              ].map(({ icon: Icon, url, bg }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* copyright */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 pb-2">
        <div className="border-t border-[#e5e5e5] pt-2 text-center text-xs text-[#a9b0b8]">
          <p>&copy; {currentYear} {copyright}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
