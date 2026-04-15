import { useTranslation } from "react-i18next";

function LanguageToggle({ className = "", scrolled = false }) {
  const { i18n } = useTranslation();
  const isHe = i18n.language === "he";

  const toggle = () => {
    i18n.changeLanguage(isHe ? "en" : "he");
  };

  // active language always gets the blue accent
  const activeStyle = "bg-[#0075ff]/15 text-[#0075ff] border-[#0075ff]/30 hover:bg-[#0075ff] hover:text-white";
  // inactive adapts to navbar state
  const inactiveStyle = scrolled
    ? "bg-gray-100 text-[#364052] border-gray-200 hover:bg-[#0075ff] hover:text-white hover:border-[#0075ff]"
    : "bg-white/10 text-white/70 border-white/20 hover:bg-[#0075ff] hover:text-white hover:border-[#0075ff]";

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all border cursor-pointer ${
        isHe ? activeStyle : inactiveStyle
      } ${className}`}
      title={isHe ? "Switch to English" : "\u05E2\u05D1\u05D5\u05E8 \u05DC\u05E2\u05D1\u05E8\u05D9\u05EA"}
    >
      <span className="text-base leading-none">{isHe ? "\uD83C\uDDEC\uD83C\uDDE7" : "\uD83C\uDDEE\uD83C\uDDF1"}</span>
      {isHe ? "EN" : "\u05E2\u05D1"}
    </button>
  );
}

export default LanguageToggle;
