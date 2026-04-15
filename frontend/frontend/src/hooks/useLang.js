import { useTranslation } from "react-i18next";

// helper hook — returns a function that picks the Hebrew field when active,
// falls back to the English field.  Usage:  l(item, "title")
// looks for item.titleHe when language is Hebrew, else item.title
export default function useLang() {
  const { i18n } = useTranslation();
  const isHe = i18n.language === "he";

  return (item, field) => {
    if (!isHe) return item?.[field] ?? "";
    const heKey = `${field}He`;
    return item?.[heKey] || item?.[field] || "";
  };
}
