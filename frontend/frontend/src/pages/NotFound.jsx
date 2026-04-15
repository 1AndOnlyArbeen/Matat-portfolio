import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";

function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#f0f4f8]">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-black text-[#0075ff] mb-2">{t("notFound.title")}</h1>
        <h2 className="text-2xl font-bold text-[#051229] mb-3">{t("notFound.heading")}</h2>
        <p className="text-[#7e8590] mb-8">
          {t("notFound.message")}
        </p>
        <Link
          to="/"
          className="btn-solvior inline-flex"
        >
          <span className="btn-icon">
            <FiArrowRight size={18} />
          </span>
          <span className="btn-text">{t("notFound.backHome")}</span>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
