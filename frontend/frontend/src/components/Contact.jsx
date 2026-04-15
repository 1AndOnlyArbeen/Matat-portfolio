import { useState } from "react";
import { useTranslation } from "react-i18next";
import { submitContact } from "../api";
import { FiSend, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [headingRef, headingVisible] = useScrollAnimation();
  const [contentRef, contentVisible] = useScrollAnimation(0.1);

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
    <section id="contact" className="relative py-24 sm:py-28 bg-[#f0f4f8] overflow-hidden">
      <div className="absolute -top-10 -left-16 w-60 h-60 bg-[#0075ff]/6 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-0 -right-16 w-52 h-52 bg-[#0075ff]/4 rounded-full blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div ref={headingRef} className={`text-center mb-14 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <span className="section-label">{t("contact.title")}</span>
          <h2 className="section-title">{t("contact.title")}</h2>
          <p className="text-[#7e8590] max-w-xl mx-auto text-base">
            {t("contact.subtitle")}
          </p>
        </div>

        <div ref={contentRef} className={`grid grid-cols-1 lg:grid-cols-5 gap-10 animate-fade-up ${contentVisible ? "visible" : ""}`}>

          {/* left side - contact details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100">
              <h3 className="text-lg font-bold text-[#051229] mb-5">{t("contact.getInTouch")}</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-[#0075ff]/10 flex items-center justify-center group-hover:bg-[#0075ff] transition-colors shrink-0">
                    <FiMapPin className="text-[#0075ff] group-hover:text-white transition-colors" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[#051229] text-sm">{t("contact.address")}</p>
                    <p className="text-[#7e8590] text-sm">{t("contact.addressValue")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-[#0075ff]/10 flex items-center justify-center group-hover:bg-[#0075ff] transition-colors shrink-0">
                    <FiMail className="text-[#0075ff] group-hover:text-white transition-colors" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[#051229] text-sm">{t("contact.email")}</p>
                    <p className="text-[#7e8590] text-sm">{t("contact.emailValue")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-[#0075ff]/10 flex items-center justify-center group-hover:bg-[#0075ff] transition-colors shrink-0">
                    <FiPhone className="text-[#0075ff] group-hover:text-white transition-colors" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[#051229] text-sm">{t("contact.phone")}</p>
                    <p className="text-[#7e8590] text-sm">{t("contact.phoneValue")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* right side - contact form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="relative space-y-4">
              {status === "sending" && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 border-3 border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
                  <p className="text-sm font-medium text-[#364052]">{t("contact.sending")}</p>
                  <p className="text-xs text-[#7e8590]">{t("contact.sendingNote")}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t("contact.yourName")}
                  required
                  disabled={status === "sending"}
                  className="w-full px-5 py-3.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-[#0075ff] focus:ring-2 focus:ring-[#0075ff]/10 text-[#364052] text-sm placeholder-[#7e8590] transition-all disabled:opacity-60"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t("contact.yourEmail")}
                  required
                  disabled={status === "sending"}
                  className="w-full px-5 py-3.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-[#0075ff] focus:ring-2 focus:ring-[#0075ff]/10 text-[#364052] text-sm placeholder-[#7e8590] transition-all disabled:opacity-60"
                />
              </div>

              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder={t("contact.subject")}
                required
                disabled={status === "sending"}
                className="w-full px-5 py-3.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-[#0075ff] focus:ring-2 focus:ring-[#0075ff]/10 text-[#364052] text-sm placeholder-[#7e8590] transition-all disabled:opacity-60"
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t("contact.yourMessage")}
                rows={5}
                required
                disabled={status === "sending"}
                className="w-full px-5 py-3.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-[#0075ff] focus:ring-2 focus:ring-[#0075ff]/10 text-[#364052] text-sm resize-none placeholder-[#7e8590] transition-all disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-solvior disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? (
                  <>
                    <span className="btn-icon">
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    </span>
                    <span className="btn-text">{t("contact.sendingBtn")}</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon">
                      <FiSend size={18} />
                    </span>
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
