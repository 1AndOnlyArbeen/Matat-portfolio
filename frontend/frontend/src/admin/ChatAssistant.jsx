import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiMessageCircle, FiExternalLink, FiAlertTriangle } from "react-icons/fi";

// URL of the standalone chatbot service (chatbot/app.js).
// Override at build time with VITE_CHATBOT_URL if you deploy it elsewhere.
const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "http://localhost:3000";

// Admin page that embeds the local Doc Assistant chatbot.
// The actual chatbot lives in /chatbot (separate Node app on :3000).
// We just iframe it here so the admin keeps one consistent shell.
function ChatAssistant() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "down"

  // probe /healthz once on mount so we can show a friendly message
  // if the user forgot to start the chatbot service
  useEffect(() => {
    let cancelled = false;
    fetch(`${CHATBOT_URL}/healthz`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then(() => { if (!cancelled) setStatus("ok"); })
      .catch(() => { if (!cancelled) setStatus("down"); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="h-full flex flex-col py-4">
      {/* page header to match the rest of the admin */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FiMessageCircle className="text-blue-600" size={22} />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Ultron
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Local bilingual documentation chatbot · Hebrew / English
            </p>
          </div>
        </div>
        <a
          href={CHATBOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
        >
          <FiExternalLink size={14} /> Open in new tab
        </a>
      </div>

      {/* service-down hint - shown only if /healthz fails */}
      {status === "down" && (
        <div className="mb-3 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-start gap-2">
          <FiAlertTriangle className="mt-0.5 shrink-0" />
          <div>
            Chatbot service not reachable at <code>{CHATBOT_URL}</code>.
            Start it with{" "}
            <code className="bg-white px-1 py-0.5 rounded">cd chatbot && npm start</code>{" "}
            and make sure Ollama is running.
          </div>
        </div>
      )}

      {/* the chatbot itself - rendered as an iframe.
          flex-1 + min-h-0 makes it fill the remaining admin content area. */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        <iframe
          title="Ultron"
          src={CHATBOT_URL}
          className="w-full h-full"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}

export default ChatAssistant;
