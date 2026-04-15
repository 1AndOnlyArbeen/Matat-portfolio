import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function AdminNotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-blue-600 mb-2">{t("admin.notFound.title")}</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t("admin.notFound.heading")}</h2>
        <p className="text-gray-500 mb-8">
          {t("admin.notFound.message")}
        </p>
        <Link
          to="/matat-admin"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          {t("admin.notFound.backToDashboard")}
        </Link>
      </div>
    </div>
  );
}

export default AdminNotFound;
