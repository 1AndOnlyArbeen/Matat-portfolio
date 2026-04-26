import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getClients } from "../api";
import useLang from "../hooks/useLang";
import useSectionHeading from "../hooks/useSectionHeading";

function AllClients() {
  const l = useLang();
  const heading = useSectionHeading("clients");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients()
      .then((res) => {
        const list = res?.clients || (Array.isArray(res) ? res : []);
        setClients(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-[3px] border-[#0075ff]/20 border-t-[#0075ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-20 sm:py-28 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[#0075ff] hover:text-[#051229] font-bold text-sm mb-8 transition-colors">
          <FiArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-12 sm:mb-16">
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
            <h2 className="section-title">
              {heading.titlePlain}{heading.titlePlain && heading.titleHighlight && " "}
              {heading.titleHighlight && <span className="text-[#0075ff]">{heading.titleHighlight}</span>}
            </h2>
          )}
          {heading.subtitle && <p className="text-[#7e8590] max-w-xl mx-auto text-base">{heading.subtitle}</p>}
        </div>

        {clients.length === 0 ? (
          <p className="text-center text-[#7e8590] py-20">No clients yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
            {clients.map((client) => (
              <Link
                key={client._id}
                to={`/clients/${client._id}`}
                className="w-full aspect-square bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_30px_rgba(0,117,255,0.15)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center p-6 border border-gray-100"
              >
                <img
                  src={client.logo}
                  alt={l(client, "clientName") || client.name}
                  className="max-w-full max-h-full object-contain opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-300 select-none"
                  draggable="false"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AllClients;
