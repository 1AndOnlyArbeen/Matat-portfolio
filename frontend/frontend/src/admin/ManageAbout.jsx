import { useState, useEffect } from "react";
import { getAllAbout, createAbout, editAbout, deleteAbout, toggleAbout } from "../api/admin";
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiInfo,
  FiChevronLeft, FiChevronRight, FiEye, FiToggleLeft, FiToggleRight,
} from "react-icons/fi";
import ConfirmModal from "./ConfirmModal";

const emptyForm = {
  title: "",
  titleHe: "",
  description: "",
  descriptionHe: "",
  mission: "",
  missionHe: "",
  headingLine1: "",
  headingLine1He: "",
  headingLine2: "",
  headingLine2He: "",
  ctaLabel: "",
  ctaLabelHe: "",
  ctaNote: "",
  ctaNoteHe: "",
  stats: [{ value: "", label: "", valueHe: "", labelHe: "" }],
  tickerItems: [{ text: "", textHe: "" }],
};

function ManageAbout() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewAll, setViewAll] = useState(false);

  // bulk selection
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    load(page);
    setSelectedIds(new Set());
  }, [page, viewAll]);

  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i._id)),
    );
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;
  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    await Promise.all(Array.from(selectedIds).map((id) => deleteAbout(id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkDeleting(false);
    await load(page);
  };

  const load = async (p = 1) => {
    const res = await getAllAbout(viewAll ? 1 : p, viewAll ? 1000 : 14);
    const data = res?.data;
    const list = data?.abouts || (Array.isArray(data) ? data : []);
    setItems(list);
    if (data?.pagination) setTotalPages(data.pagination.totalPages || 1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setMessage("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      titleHe: item.titleHe || "",
      description: item.description || "",
      descriptionHe: item.descriptionHe || "",
      mission: item.mission || "",
      missionHe: item.missionHe || "",
      headingLine1: item.headingLine1 || "",
      headingLine1He: item.headingLine1He || "",
      headingLine2: item.headingLine2 || "",
      headingLine2He: item.headingLine2He || "",
      ctaLabel: item.ctaLabel || "",
      ctaLabelHe: item.ctaLabelHe || "",
      ctaNote: item.ctaNote || "",
      ctaNoteHe: item.ctaNoteHe || "",
      stats: item.stats?.length ? item.stats.map((s) => ({ value: s.value || "", label: s.label || "", valueHe: s.valueHe || "", labelHe: s.labelHe || "" })) : [{ value: "", label: "", valueHe: "", labelHe: "" }],
      tickerItems: item.tickerItems?.length
        ? item.tickerItems.map((t) => ({ text: t.text || "", textHe: t.textHe || "" }))
        : [{ text: "", textHe: "" }],
    });
    setMessage("");
    setShowModal(true);
  };

  const updateStat = (index, field, value) => {
    const updated = [...form.stats];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, stats: updated });
  };
  const addStat = () => setForm({ ...form, stats: [...form.stats, { value: "", label: "", valueHe: "", labelHe: "" }] });
  const removeStat = (index) => setForm({ ...form, stats: form.stats.filter((_, i) => i !== index) });

  const updateTicker = (index, field, value) => {
    const updated = [...(form.tickerItems || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, tickerItems: updated });
  };
  const addTicker = () =>
    setForm({ ...form, tickerItems: [...(form.tickerItems || []), { text: "", textHe: "" }] });
  const removeTicker = (index) =>
    setForm({ ...form, tickerItems: (form.tickerItems || []).filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      title: form.title,
      titleHe: form.titleHe,
      description: form.description,
      descriptionHe: form.descriptionHe,
      mission: form.mission,
      missionHe: form.missionHe,
      headingLine1: form.headingLine1,
      headingLine1He: form.headingLine1He,
      headingLine2: form.headingLine2,
      headingLine2He: form.headingLine2He,
      ctaLabel: form.ctaLabel,
      ctaLabelHe: form.ctaLabelHe,
      ctaNote: form.ctaNote,
      ctaNoteHe: form.ctaNoteHe,
      stats: form.stats.filter((s) => s.value.trim() || s.label.trim()).map((s) => ({ value: s.value, label: s.label, valueHe: s.valueHe, labelHe: s.labelHe })),
      tickerItems: (form.tickerItems || [])
        .filter((t) => (t.text || "").trim() || (t.textHe || "").trim())
        .map((t) => ({ text: t.text, textHe: t.textHe })),
    };

    const result = editing
      ? await editAbout(editing._id, payload)
      : await createAbout(payload);

    if (result) {
      await load(page);
      setShowModal(false);
    } else {
      setMessage("Failed to save. Try again.");
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteAbout(deleteId);
    setDeleteId(null);
    if (result) {
      if (items.length === 1 && page > 1) setPage(page - 1);
      else await load(page);
    }
  };

  // toggle active/inactive — only one about can be active at a time
  const handleToggle = async (id) => {
    const result = await toggleAbout(id);
    if (result) await load(page);
  };

  return (
    <div>
      {/* sticky header */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Manage About</h2>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-3 py-2 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
              >
                <FiX size={13} /> Unselect All ({selectedIds.size})
              </button>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
              >
                <FiTrash2 size={13} /> Delete Selected ({selectedIds.size})
              </button>
            </>
          )}
          <button
            onClick={() => { setViewAll((v) => !v); setPage(1); }}
            className="bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors"
          >
            {viewAll ? "Show Pages" : "View All"}
          </button>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FiPlus size={16} /> Add About
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto rounded-xl border border-blue-300/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(30,64,175,0.15)]">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-14 z-20 bg-blue-50 text-gray-700 text-[11px] uppercase tracking-wide shadow-[0_2px_6px_rgba(30,64,175,0.08)]">
            <tr>
              <th className="px-3 py-2 w-8">
                <input type="checkbox" checked={allSelected} ref={(el) => el && (el.indeterminate = someSelected)} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-600 cursor-pointer" title="Select all on this page" />
              </th>
              <th className="px-3 py-2 font-semibold">Title</th>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 font-semibold">Mission</th>
              <th className="px-3 py-2 font-semibold">Stats</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/60">
            {items.map((item) => (
              <tr
                key={item._id}
                className={`transition-colors ${selectedIds.has(item._id) ? "bg-red-50/60 hover:bg-red-50" : item.isActive ? "bg-green-50/40 hover:bg-green-50/70" : "hover:bg-blue-50/40"}`}
              >
                <td className="px-3 py-2 w-8">
                  <input type="checkbox" checked={selectedIds.has(item._id)} onChange={() => toggleSelect(item._id)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                </td>
                <td className="px-3 py-2 font-medium text-gray-800 max-w-[180px] truncate">{item.title || "-"}</td>
                <td className="px-3 py-2 text-gray-500 max-w-[260px] truncate">{item.description || "-"}</td>
                <td className="px-3 py-2 text-gray-500 max-w-[220px] truncate">{item.mission || "-"}</td>
                <td className="px-3 py-2 text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <FiInfo size={12} /> {item.stats?.length || 0}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      item.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleToggle(item._id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        item.isActive
                          ? "text-green-600 hover:bg-green-100"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title={item.isActive ? "Deactivate" : "Activate"}
                    >
                      {item.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                    </button>
                    <button onClick={() => setViewItem(item)} className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer" title="View"><FiEye size={14} /></button>
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg cursor-pointer" title="Edit"><FiEdit2 size={14} /></button>
                    <button onClick={() => setDeleteId(item._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer" title="Delete"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No About section yet. Click "Add About" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {!viewAll && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`w-8 h-8 rounded-lg text-sm font-medium cursor-pointer transition-colors ${num === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}

      {/* CREATE / EDIT modal — centered */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-[2px] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300">
            {saving && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">Saving changes...</p>
              </div>
            )}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit About" : "Add About"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (headline)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Who We Are, Our Story, Matat Digital"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Shown as the big headline on the public About section. The "About" section label itself is already fixed.
                </p>
                <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={form.titleHe}
                  onChange={(e) => setForm({ ...form, titleHe: e.target.value })}
                  placeholder="כותרת בעברית"
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
                <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                <textarea
                  dir="rtl"
                  value={form.descriptionHe}
                  onChange={(e) => setForm({ ...form, descriptionHe: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
                <textarea
                  value={form.mission}
                  onChange={(e) => setForm({ ...form, mission: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
                <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                <textarea
                  dir="rtl"
                  value={form.missionHe}
                  onChange={(e) => setForm({ ...form, missionHe: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* big heading lines (public About hero — split into two lines) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heading — Line 1</label>
                  <input
                    type="text"
                    value={form.headingLine1}
                    onChange={(e) => setForm({ ...form, headingLine1: e.target.value })}
                    placeholder="About"
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.headingLine1He}
                    onChange={(e) => setForm({ ...form, headingLine1He: e.target.value })}
                    placeholder="אודות"
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heading — Line 2</label>
                  <input
                    type="text"
                    value={form.headingLine2}
                    onChange={(e) => setForm({ ...form, headingLine2: e.target.value })}
                    placeholder="Us."
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.headingLine2He}
                    onChange={(e) => setForm({ ...form, headingLine2He: e.target.value })}
                    placeholder="שלנו."
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* CTA button label + small note next to it */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Label</label>
                  <input
                    type="text"
                    value={form.ctaLabel}
                    onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                    placeholder="Get In Touch"
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.ctaLabelHe}
                    onChange={(e) => setForm({ ...form, ctaLabelHe: e.target.value })}
                    placeholder="צור קשר"
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Note</label>
                  <input
                    type="text"
                    value={form.ctaNote}
                    onChange={(e) => setForm({ ...form, ctaNote: e.target.value })}
                    placeholder="Response within 24h"
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <label className="block text-xs text-gray-400 mb-1 mt-2">Hebrew (HE)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.ctaNoteHe}
                    onChange={(e) => setForm({ ...form, ctaNoteHe: e.target.value })}
                    placeholder="תגובה תוך 24 שעות"
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* stats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stats</label>
                <div className="space-y-2">
                  {form.stats?.map((stat, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => updateStat(index, "value", e.target.value)}
                          placeholder="150+"
                          className="w-24 px-3 py-2 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => updateStat(index, "label", e.target.value)}
                          placeholder="Projects Completed"
                          className="flex-1 px-3 py-2 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeStat(index)}
                          className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                      <label className="block text-xs text-gray-400 mb-1">Hebrew (HE)</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          dir="rtl"
                          value={stat.valueHe}
                          onChange={(e) => updateStat(index, "valueHe", e.target.value)}
                          placeholder="150+"
                          className="w-24 px-3 py-2 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          dir="rtl"
                          value={stat.labelHe}
                          onChange={(e) => updateStat(index, "labelHe", e.target.value)}
                          placeholder="פרויקטים שהושלמו"
                          className="flex-1 px-3 py-2 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addStat}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <FiPlus size={14} /> Add Stat
                </button>
              </div>

              {/* ticker items — bottom marquee on the public About */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ticker Items</label>
                <p className="text-xs text-gray-400 mb-2">
                  Each item becomes one chip on the running ticker at the bottom of the About section
                  (e.g. "WordPress Development", "WooCommerce", "Laravel Solutions").
                </p>
                <div className="space-y-2">
                  {(form.tickerItems || []).map((tk, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={tk.text}
                          onChange={(e) => updateTicker(index, "text", e.target.value)}
                          placeholder="WordPress Development"
                          className="flex-1 px-3 py-2 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeTicker(index)}
                          className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                      <label className="block text-xs text-gray-400 mb-1">Hebrew (HE)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={tk.textHe}
                        onChange={(e) => updateTicker(index, "textHe", e.target.value)}
                        placeholder="פיתוח וורדפרס"
                        className="w-full px-3 py-2 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addTicker}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <FiPlus size={14} /> Add Ticker
                </button>
              </div>

              {message && <p className="text-sm text-red-500 font-medium">{message}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer"
                >
                  <FiSave size={14} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
          <div
            className="relative bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">About — Details</h3>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Title</p>
                <p className="text-gray-800 font-medium">{viewItem.title || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Description</p>
                <p className="text-gray-700 whitespace-pre-wrap">{viewItem.description || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Mission</p>
                <p className="text-gray-700 whitespace-pre-wrap">{viewItem.mission || "-"}</p>
              </div>
              {viewItem.stats?.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Stats</p>
                  <div className="grid grid-cols-2 gap-3">
                    {viewItem.stats.map((s, i) => (
                      <div key={i} className="bg-blue-50/60 rounded-lg p-3">
                        <p className="text-blue-700 font-bold text-lg">{s.value}</p>
                        <p className="text-gray-600 text-xs">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewItem.tickerItems?.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Ticker Items</p>
                  <div className="flex flex-wrap gap-2">
                    {viewItem.tickerItems.map((t, i) => (
                      <span key={i} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {t.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="This About entry will be permanently deleted." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      )}

      {bulkDeleteOpen && (
        <ConfirmModal
          message={`${selectedIds.size} About entr${selectedIds.size > 1 ? "ies" : "y"} will be permanently deleted.${bulkDeleting ? " Deleting…" : ""}`}
          onConfirm={confirmBulkDelete}
          onCancel={() => !bulkDeleting && setBulkDeleteOpen(false)}
        />
      )}
    </div>
  );
}

export default ManageAbout;
