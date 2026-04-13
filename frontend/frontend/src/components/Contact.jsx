import { useState } from "react";
import { submitContact } from "../api";
import { FiSend, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

// contact section with form and contact info
// form submits to /api/contact via POST
// shows success/error feedback after submission
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [headingRef, headingVisible] = useScrollAnimation();
  const [contentRef, contentVisible] = useScrollAnimation(0.1);

  // update form field
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // submit contact form to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    const result = await submitContact(form);
    if (result) {
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" }); // reset form
    } else {
      setStatus("error");
    }

    // auto-hide status message after 4 seconds
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div ref={headingRef} className={`text-center mb-12 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">Contact Us</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Have a project in mind? Let&apos;s talk about it.
          </p>
        </div>

        <div ref={contentRef} className={`grid grid-cols-1 lg:grid-cols-5 gap-10 animate-fade-up ${contentVisible ? "visible" : ""}`}>

          {/* left side - contact details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Get in Touch</h3>
              <div className="space-y-4">

                {/* address */}
                <div className="flex items-start gap-3 group">
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FiMapPin className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Address</p>
                    <p className="text-gray-500 text-sm">Kathmandu, Nepal</p>
                  </div>
                </div>

                {/* email */}
                <div className="flex items-start gap-3 group">
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FiMail className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Email</p>
                    <p className="text-gray-500 text-sm">hello@portfolio.com</p>
                  </div>
                </div>

                {/* phone */}
                <div className="flex items-start gap-3 group">
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FiPhone className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Phone</p>
                    <p className="text-gray-500 text-sm">+977 9800000000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* right side - contact form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="relative space-y-4">
              {/* sending overlay — covers the whole form while submitting */}
              {status === "sending" && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-gray-700">Sending your message...</p>
                  <p className="text-xs text-gray-400">This may take a few seconds</p>
                </div>
              )}

              {/* name and email side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow disabled:opacity-60"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  required
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow disabled:opacity-60"
                />
              </div>

              {/* subject */}
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                disabled={status === "sending"}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow disabled:opacity-60"
              />

              {/* message */}
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows={5}
                required
                disabled={status === "sending"}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-shadow disabled:opacity-60"
              />

              {/* send button — spinner appears when sending */}
              <button
                type="submit"
                disabled={status === "sending"}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
              >
                {status === "sending" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend size={16} />
                    Send Message
                  </>
                )}
              </button>

              {/* success/error feedback */}
              {status === "success" && (
                <p className="text-green-600 text-sm font-medium">Message sent successfully!</p>
              )}
              {status === "error" && (
                <p className="text-red-500 text-sm font-medium">Failed to send. Please try again later.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
