import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { submitContact, getFooterSettings } from "../api";
import { FiSend, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import useSectionHeading from "../hooks/useSectionHeading";
import useLang from "../hooks/useLang";

function Contact() {
  const { t } = useTranslation();
  const l = useLang();
  const heading = useSectionHeading("contact");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [mounted, setMounted] = useState(false);
  const [footer, setFooter] = useState(null);
  const sectionRef = useRef(null);

  // pull contact info (address/email/phone) from the same Footer document the admin edits
  useEffect(() => {
    getFooterSettings().then((res) => {
      if (res) setFooter(res);
    });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setMounted(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    const result = await submitContact(form);
    if (result) {
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } else {
      setStatus("error");
    }

    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <section id="contact" ref={sectionRef} className="relative py-24 sm:py-28 bg-white overflow-hidden">
      {/* subtle decorative blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#0075ff]/5 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#0075ff]/3 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* centered heading */}
        <div
          className="text-center mb-14"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(60px)",
            transition: "all 0.8s ease",
          }}
        >
          {heading.label && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0075ff]/5 border border-[#0075ff]/10 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0075ff] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0075ff]" />
              </span>
              <span className="text-xs font-bold tracking-widest text-[#0075ff] uppercase">{heading.label}</span>
            </div>
          )}
          {(heading.titlePlain || heading.titleHighlight) && (
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#051229] mb-2">
              {heading.titlePlain}
              {heading.titlePlain && heading.titleHighlight && " "}
              {heading.titleHighlight && (
                <span className="text-[#0075ff]">{heading.titleHighlight}</span>
              )}
            </h2>
          )}
          {heading.subtitle && (
            <p className="text-[#7e8590] text-base max-w-xl mx-auto">{heading.subtitle}</p>
          )}
        </div>

        {/* content grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-10"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease 0.2s",
          }}
        >
          {/* left — contact info (hidden on mobile, visible from lg up) */}
          <div className="hidden lg:block lg:col-span-2 space-y-5">
            <div
              className="bg-[#f0f2f5] rounded-2xl p-6 border border-[#e5e5e5]/50"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(50px)",
                transition: "all 0.7s ease 0.3s",
              }}
            >
              <h3 className="text-lg font-bold text-[#051229] mb-5">{t("contact.getInTouch")}</h3>
              <div className="space-y-5">
                {[
                  { icon: FiMapPin, label: t("contact.address"), value: footer ? l(footer, "location") : "" },
                  { icon: FiMail,   label: t("contact.email"),   value: footer?.email || "" },
                  { icon: FiPhone,  label: t("contact.phone"),   value: footer?.phone || "" },
                ]
                  .filter(({ value }) => !!value)
                  .map(({ icon: Icon, label, value }, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-[#0075ff]/8 flex items-center justify-center group-hover:bg-[#0075ff] transition-colors shrink-0">
                        <Icon className="text-[#0075ff] group-hover:text-white transition-colors" size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-[#051229] text-sm">{label}</p>
                        <p className="text-[#7e8590] text-sm">{value}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* right — form */}
          <div
            className="lg:col-span-3"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0) scale(1)" : "translateY(60px) scale(0.98)",
              transition: "all 0.8s ease 0.4s",
            }}
          >
            <form onSubmit={handleSubmit} className="relative space-y-4">
              {status === "sending" && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 border-3 border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
                  <p className="text-sm font-medium text-[#364052]">{t("contact.sending")}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder={t("contact.yourName")} required disabled={status === "sending"}
                  className="w-full px-5 py-3.5 rounded-xl bg-[#f0f2f5] border border-[#e5e5e5]/50 focus:outline-none focus:border-[#0075ff] focus:ring-2 focus:ring-[#0075ff]/10 text-[#051229] text-sm placeholder-[#7e8590] transition-all disabled:opacity-60"
                />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder={t("contact.yourEmail")} required disabled={status === "sending"}
                  className="w-full px-5 py-3.5 rounded-xl bg-[#f0f2f5] border border-[#e5e5e5]/50 focus:outline-none focus:border-[#0075ff] focus:ring-2 focus:ring-[#0075ff]/10 text-[#051229] text-sm placeholder-[#7e8590] transition-all disabled:opacity-60"
                />
              </div>

              <input
                type="text" name="subject" value={form.subject} onChange={handleChange}
                placeholder={t("contact.subject")} required disabled={status === "sending"}
                className="w-full px-5 py-3.5 rounded-xl bg-[#f0f2f5] border border-[#e5e5e5]/50 focus:outline-none focus:border-[#0075ff] focus:ring-2 focus:ring-[#0075ff]/10 text-[#051229] text-sm placeholder-[#7e8590] transition-all disabled:opacity-60"
              />

              <textarea
                name="message" value={form.message} onChange={handleChange}
                placeholder={t("contact.yourMessage")} rows={5} required disabled={status === "sending"}
                className="w-full px-5 py-3.5 rounded-xl bg-[#f0f2f5] border border-[#e5e5e5]/50 focus:outline-none focus:border-[#0075ff] focus:ring-2 focus:ring-[#0075ff]/10 text-[#051229] text-sm resize-none placeholder-[#7e8590] transition-all disabled:opacity-60"
              />

              <button
                type="submit" disabled={status === "sending"}
                className="btn-solvior btn-pulse disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? (
                  <>
                    <span className="btn-icon"><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /></span>
                    <span className="btn-text">{t("contact.sendingBtn")}</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon"><FiSend size={18} /></span>
                    <span className="btn-text">{t("contact.sendMessage")}</span>
                  </>
                )}
              </button>

              {status === "success" && (
                <p className="text-green-600 text-sm font-medium">{t("contact.success")}</p>
              )}
              {status === "error" && (
                <p className="text-red-500 text-sm font-medium">{t("contact.error")}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
