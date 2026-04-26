import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiGithub, FiLinkedin, FiTwitter, FiFacebook, FiInstagram } from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import { getFooterSettings } from "../api";
import useLang from "../hooks/useLang";
// header logo (admin-panel logo) used at the top of the footer
import footerLogo from "../assets/matat-logo-new1.svg";
// small footer-strip logo placed beside the copyright line
import copyrightLogo from "../assets/matat.footer.svg";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-3 pb-2 flex flex-col lg:flex-row gap-6">

        {/* left 50% — logo on top, tagline beneath it */}
        <div className="lg:w-1/2 flex flex-col items-start gap-3">
          <img src={footerLogo} alt="Matat" className="h-12 sm:h-16 w-auto shrink-0" />
          <p className="text-sm leading-snug text-[#7e8590] max-w-[320px]">
            {tagline}
          </p>
        </div>

        {/* right 50% — Home + Gallery share a row on mobile (2 cols with a divider between),
            Follow Us drops to its own row */}
        <div className="lg:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-4">
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
          {/* divider line on mobile only — vanishes once the row gets the third column on sm+ */}
          <div className="border-l border-[#e5e5e5] pl-4 sm:border-l-0 sm:pl-0">
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
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-sm font-bold text-[#051229] mb-3">Follow Us</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: FiFacebook,  url: data?.facebookUrl,  bg: "bg-[#1877F2]" },
                { icon: FiInstagram, url: data?.instagramUrl, bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]" },
                { icon: FaTiktok,    url: data?.tiktokUrl,    bg: "bg-[#000000]" },
                { icon: FiLinkedin,  url: data?.linkedinUrl,  bg: "bg-[#0A66C2]" },
                { icon: FiTwitter,   url: data?.twitterUrl,   bg: "bg-[#1DA1F2]" },
                { icon: FiGithub,    url: data?.githubUrl,    bg: "bg-[#333]" },
              ].map(({ icon: Icon, url, bg }, i) => {
                const enabled = !!url;
                return (
                  <a
                    key={i}
                    href={enabled ? url : undefined}
                    target={enabled ? "_blank" : undefined}
                    rel={enabled ? "noopener noreferrer" : undefined}
                    onClick={(e) => { if (!enabled) e.preventDefault(); }}
                    aria-disabled={!enabled}
                    className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white transition-all ${
                      enabled
                        ? "hover:scale-110 hover:shadow-lg cursor-pointer"
                        : "opacity-50 cursor-default"
                    }`}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* copyright — light blue strip with logo + text inline */}
      <div
        className="w-full py-2 text-[11px] text-[#0a3a7a]"
        style={{ background: "#cfe6ff" }}
      >
        <div className="flex items-center justify-center gap-2">
          <img
            src={copyrightLogo}
            alt="Matat"
            className="h-4 w-auto"
          />
          <span>&copy; {currentYear} {copyright}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
