import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { getFooterSettings } from "../api";
import useLang from "../hooks/useLang";
import logo from "../assets/matat-logo-white.svg";

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
    <footer className="relative bg-[#051229] border-t border-[#27354d] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8">

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12">

          {/* col 1 -- brand */}
          <div className="space-y-5">
            <img src={logo} alt="Matat" className="h-9 w-auto" />
            <p className="text-sm leading-relaxed text-[#a9b0b8] max-w-[260px]">
              {tagline}
            </p>
            {socials.length > 0 && (
              <div className="flex items-center gap-3 pt-1">
                {socials.map(({ icon: Icon, url }, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* col 2 -- quick links */}
          <div>
            <h4 className="text-[18px] font-bold text-white mb-8 tracking-tight">{t("nav.home")}</h4>
            <ul className="space-y-3">
              {[
                { label: t("nav.projects"), href: "#projects" },
                { label: t("nav.apps"), href: "#apps" },
                { label: t("nav.clients"), href: "#clients" },
                { label: t("nav.about"), href: "#about" },
                { label: t("nav.team"), href: "#team" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="footer-link text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* col 3 -- more links */}
          <div>
            <h4 className="text-[18px] font-bold text-white mb-8 tracking-tight">{t("nav.gallery")}</h4>
            <ul className="space-y-3">
              {[
                { label: t("nav.testimonials"), href: "#testimonials" },
                { label: t("nav.gallery"), href: "#gallery" },
                { label: t("nav.contact"), href: "#contact" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="footer-link text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* col 4 -- contact */}
          <div>
            <h4 className="text-[18px] font-bold text-white mb-8 tracking-tight">{t("contact.getInTouch")}</h4>
            <ul className="space-y-5">
              <li>
                <p className="text-xs text-[#676e7a] mb-1">{t("contact.email")}</p>
                <a href={`mailto:${email}`} className="footer-link text-sm text-white">
                  {email}
                </a>
              </li>
              <li>
                <p className="text-xs text-[#676e7a] mb-1">{t("contact.phone")}</p>
                <a href={`tel:${phone}`} className="footer-link text-sm text-white">
                  {phone}
                </a>
              </li>
              <li>
                <p className="text-xs text-[#676e7a] mb-1">{t("contact.address")}</p>
                <p className="text-sm text-[#a9b0b8]">{location}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-[#27354d] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#676e7a]">
          <p>&copy; {currentYear} {copyright}</p>
          <p>{tagline}</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
