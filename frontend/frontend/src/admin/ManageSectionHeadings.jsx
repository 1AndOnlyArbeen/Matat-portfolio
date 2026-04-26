import { useEffect, useState } from "react";
import { FiSave, FiType, FiCheckCircle } from "react-icons/fi";
import { getSectionHeadings, upsertSectionHeading } from "../api/admin";
import { refreshSectionHeadings } from "../hooks/useSectionHeading";

// every section the public site exposes — keep keys in sync with the keys
// passed to useSectionHeading() in the public components
const SECTIONS = [
  { key: "projects",     name: "Projects",      placeholderTitle: "Our Projects" },
  { key: "apps",         name: "Apps",          placeholderTitle: "Our Apps" },
  { key: "clients",      name: "Clients",       placeholderTitle: "Our Clients" },
  { key: "about",        name: "About",         placeholderTitle: "About Us" },
  { key: "team",         name: "Team",          placeholderTitle: "Meet Our Team" },
  { key: "testimonials", name: "Testimonials",  placeholderTitle: "What Our Clients Say" },
  { key: "contact",      name: "Contact",       placeholderTitle: "Get In Touch" },
  { key: "gallery",      name: "Gallery",       placeholderTitle: "Memories from the road" },
];

const empty = {
  label: "", title: "", subtitle: "",
  labelHe: "", titleHe: "", subtitleHe: "",
};

// split a title string into (plain, lastWord) — the last word is rendered in blue
function splitLastWord(s) {
  const trimmed = (s || "").trim();
  if (!trimmed) return { plain: "", highlight: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { plain: "", highlight: parts[0] };
  return { plain: parts.slice(0, -1).join(" "), highlight: parts.slice(-1).join(" ") };
}

// rebuild the form state from a server row (which still uses the
// titlePlain + titleHighlight fields under the hood)
function rowToForm(row) {
  if (!row) return { ...empty };
  return {
    label: row.label || "",
    title: [row.titlePlain, row.titleHighlight].filter(Boolean).join(" ").trim(),
    subtitle: row.subtitle || "",
    labelHe: row.labelHe || "",
    titleHe: [row.titlePlainHe, row.titleHighlightHe].filter(Boolean).join(" ").trim(),
    subtitleHe: row.subtitleHe || "",
  };
}

function HeadingCard({ section, initial, onSaved }) {
  const [form, setForm] = useState(rowToForm(initial));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    setForm(rowToForm(initial));
  }, [initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // server still stores titlePlain + titleHighlight so we split the
    // single Title input on save — last word goes into the blue highlight slot
    const en = splitLastWord(form.title);
    const he = splitLastWord(form.titleHe);
    const payload = {
      label: form.label,
      titlePlain: en.plain,
      titleHighlight: en.highlight,
      subtitle: form.subtitle,
      labelHe: form.labelHe,
      titlePlainHe: he.plain,
      titleHighlightHe: he.highlight,
      subtitleHe: form.subtitleHe,
    };
    const res = await upsertSectionHeading(section.key, payload);
    setSaving(false);
    if (res) {
      setSavedAt(Date.now());
      refreshSectionHeadings();
      onSaved?.();
      setTimeout(() => setSavedAt(null), 2200);
    }
  };

  // live preview matches the public render
  const preview = splitLastWord(form.title || section.placeholderTitle);

  return (
    <form
      onSubmit={submit}
      className="relative bg-white rounded-xl border border-blue-200/70 p-5 shadow-[0_2px_14px_rgba(37,99,235,0.08)]"
    >
      {/* full-card saving overlay */}
      {saving && (
        <div className="absolute inset-0 z-20 bg-white/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-700">Saving {section.name}…</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FiType size={15} />
          </span>
          <h3 className="text-base font-bold text-gray-800">{section.name}</h3>
          <span className="text-[11px] text-gray-400 font-mono">/{section.key}</span>
        </div>
        {savedAt && (
          <span className="text-green-600 text-xs flex items-center gap-1 animate-fade-in">
            <FiCheckCircle size={13} /> Saved
          </span>
        )}
      </div>

      {/* live preview — last word in blue, exactly how the public site renders */}
      <div className="mb-4 px-4 py-3 rounded-lg bg-gradient-to-br from-blue-50/50 to-white border border-blue-100">
        {form.label && (
          <p className="text-[10px] tracking-[0.25em] uppercase text-blue-600 font-bold mb-1">
            {form.label}
          </p>
        )}
        <p className="text-2xl font-extrabold text-[#051229] leading-tight">
          {preview.plain}{preview.plain && " "}
          <span className="text-[#0075ff]">{preview.highlight}</span>
        </p>
        {form.subtitle && (
          <p className="text-xs text-[#7e8590] mt-1">{form.subtitle}</p>
        )}
      </div>

      {/* English fields */}
      <div className="space-y-3">
        <Field
          label="Eyebrow Label"
          value={form.label}
          onChange={(v) => set("label", v)}
          placeholder={`e.g. ${section.name}`}
          help="Small uppercase tag inside the blue pill above the title."
        />
        <Field
          label="Title"
          value={form.title}
          onChange={(v) => set("title", v)}
          placeholder={section.placeholderTitle}
          help="The last word is automatically shown in blue."
        />
        <TextareaField
          label="Subtitle"
          value={form.subtitle}
          onChange={(v) => set("subtitle", v)}
        />
      </div>

      {/* Hebrew fields */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Hebrew</p>
        <Field label="Eyebrow Label (HE)" value={form.labelHe} onChange={(v) => set("labelHe", v)} dir="rtl" />
        <Field label="Title (HE)" value={form.titleHe} onChange={(v) => set("titleHe", v)} dir="rtl" help="The last word is automatically shown in blue." />
        <TextareaField label="Subtitle (HE)" value={form.subtitleHe} onChange={(v) => set("subtitleHe", v)} dir="rtl" />
      </div>

      <div className="flex justify-end mt-5">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <FiSave size={14} /> Save
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, dir, help }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
      />
      {help && <p className="text-[11px] text-gray-400 mt-1">{help}</p>}
    </div>
  );
}

function TextareaField({ label, value, onChange, dir }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <textarea
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
      />
    </div>
  );
}

function ManageSectionHeadings() {
  const [map, setMap] = useState({});

  const load = async () => {
    const res = await getSectionHeadings();
    setMap(res?.data || res || {});
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Section Headings</h2>
          <p className="text-xs text-gray-400">
            One Title and one Subtitle per section — the last word of the Title is automatically rendered in blue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {SECTIONS.map((s) => (
          <HeadingCard
            key={s.key}
            section={s}
            initial={map[s.key]}
            onSaved={load}
          />
        ))}
      </div>
    </div>
  );
}

export default ManageSectionHeadings;
