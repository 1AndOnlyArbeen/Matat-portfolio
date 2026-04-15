import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useLang from "../hooks/useLang";
import { getClientById } from "../api";
import { FiArrowLeft, FiExternalLink, FiBriefcase, FiGrid, FiArrowRight } from "react-icons/fi";

function ClientDetail() {
  const { t } = useTranslation();
  const l = useLang();
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientById(id).then((res) => {
      setClient(res || null);
      setLoading(false);
    }).catch(() => {
      setClient(null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#7e8590]">
        <p className="text-lg mb-4">{t("clientDetail.notFound")}</p>
        <Link to="/" className="text-[#0075ff] hover:text-[#051229] flex items-center gap-2 font-bold">
          <FiArrowLeft size={16} /> {t("clientDetail.backHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          to="/#clients"
          className="inline-flex items-center gap-2 text-[#0075ff] hover:text-[#051229] mb-8 text-sm font-bold transition-colors link-underline"
        >
          <FiArrowLeft size={16} /> {t("clientDetail.backToClients")}
        </Link>

        <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(5,18,41,0.12)] border border-gray-100 overflow-hidden">

          <div className="bg-[#f0f4f8] p-8 sm:p-12 flex flex-col items-center text-center">
            {client.logo && (
              <img src={client.logo} alt={l(client, "clientName") || client.name} className="h-16 sm:h-20 object-contain mb-4" />
            )}
            <h1 className="text-3xl sm:text-4xl font-black text-[#051229] mb-2">{l(client, "clientName") || client.name}</h1>
            {client.industry && (
              <span className="inline-flex items-center gap-1 bg-[#0075ff]/10 text-[#0075ff] text-sm px-4 py-1.5 rounded-full font-bold">
                <FiBriefcase size={12} /> {client.industry}
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {client.description && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#051229] mb-2">{t("clientDetail.about")}</h2>
                <p className="text-[#364052] leading-relaxed">{client.description}</p>
              </div>
            )}

            {client.projects && client.projects.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#051229] mb-3 flex items-center gap-2">
                  <FiGrid size={16} className="text-[#0075ff]" /> {t("clientDetail.projectsTogether")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {client.projects.map((project, i) => (
                    <span key={i} className="bg-[#e1e8f0] text-[#364052] text-sm px-4 py-2 rounded-lg font-bold">
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {client.website && client.website !== "#" && (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solvior inline-flex"
              >
                <span className="btn-icon"><FiExternalLink size={18} /></span>
                <span className="btn-text">{t("clientDetail.visitWebsite")}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDetail;
