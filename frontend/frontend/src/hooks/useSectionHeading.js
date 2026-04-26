import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSectionHeadings } from "../api";

// shared in-memory cache so every component shares one network round-trip
let cache = null;
let pending = null;
const subscribers = new Set();

function loadOnce() {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = getSectionHeadings().then((res) => {
      cache = res?.data || res || {};
      pending = null;
      subscribers.forEach((fn) => fn(cache));
      return cache;
    });
  }
  return pending;
}

// public refresh — call after admin saves so the site picks up new copy
export function refreshSectionHeadings() {
  cache = null;
  return loadOnce();
}

// useSectionHeading('team') -> { label, titlePlain, titleHighlight, subtitle, title, loaded }
// returns ONLY what admin has saved in the database. when the admin hasn't filled
// a field the corresponding return value is an empty string — public components
// should render conditionally so nothing static leaks through.
export default function useSectionHeading(section) {
  const { i18n } = useTranslation();
  const [, setTick] = useState(0);
  const isHe = i18n.language === "he";

  useEffect(() => {
    let alive = true;
    loadOnce().then(() => alive && setTick((n) => n + 1));
    const fn = () => alive && setTick((n) => n + 1);
    subscribers.add(fn);
    return () => {
      alive = false;
      subscribers.delete(fn);
    };
  }, []);

  const row = cache?.[section] || null;
  const pick = (en, he) => (isHe ? (he || en || "") : (en || ""));

  const label = row ? pick(row.label, row.labelHe) : "";
  const titlePlain = row ? pick(row.titlePlain, row.titlePlainHe) : "";
  const titleHighlight = row ? pick(row.titleHighlight, row.titleHighlightHe) : "";
  const subtitle = row ? pick(row.subtitle, row.subtitleHe) : "";

  return {
    label,
    titlePlain,
    titleHighlight,
    subtitle,
    title: [titlePlain, titleHighlight].filter(Boolean).join(" "),
    loaded: !!row,
  };
}
