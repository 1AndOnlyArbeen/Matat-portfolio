import { useState, useEffect } from "react";
import { getFooterAdmin, updateFooterAdmin } from "../api/admin";
import { FiSave, FiCheck } from "react-icons/fi";

function ManageFooter() {
  const [form, setForm] = useState({
    tagline: "", taglineHe: "",
    email: "", phone: "",
    location: "", locationHe: "",
    copyright: "", copyrightHe: "",
    githubUrl: "", linkedinUrl: "", twitterUrl: "",
    facebookUrl: "", instagramUrl: "", tiktokUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadFooter();
  }, []);

  const loadFooter = async () => {
    const res = await getFooterAdmin();
    const d = res?.data;
    if (d) {
      setForm({
        tagline: d.tagline || "",
        taglineHe: d.taglineHe || "",
        email: d.email || "",
        phone: d.phone || "",
        location: d.location || "",
        locationHe: d.locationHe || "",
        copyright: d.copyright || "",
        copyrightHe: d.copyrightHe || "",
        githubUrl: d.githubUrl || "",
        linkedinUrl: d.linkedinUrl || "",
        twitterUrl: d.twitterUrl || "",
        facebookUrl: d.facebookUrl || "",
        instagramUrl: d.instagramUrl || "",
        tiktokUrl: d.tiktokUrl || "",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateFooterAdmin(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const f = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-white border-b border-blue-100/60 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-800">Manage Footer</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
        >
          {saved ? <><FiCheck size={14} /> Saved</> : saving ? "Saving..." : <><FiSave size={14} /> Save Changes</>}
        </button>
      </div>

      <div className="space-y-6 max-w-2xl">

        {/* Tagline */}
        <div className="rounded-xl border border-blue-200/60 bg-blue-50/40 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-blue-900">Tagline</h3>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">English (EN)</label>
            <input type="text" value={form.tagline} onChange={(e) => f("tagline", e.target.value)} placeholder="Developed by Matat Technologies LTD" className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hebrew (HE)</label>
            <input type="text" dir="rtl" value={form.taglineHe} onChange={(e) => f("taglineHe", e.target.value)} placeholder="פותח על ידי Matat Technologies LTD" className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-xl border border-blue-200/60 bg-blue-50/40 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-blue-900">Contact Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => f("email", e.target.value)} placeholder="hello@portfolio.com" className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => f("phone", e.target.value)} placeholder="+977 9800000000" className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location (EN)</label>
            <input type="text" value={form.location} onChange={(e) => f("location", e.target.value)} placeholder="Kathmandu, Nepal" className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Location — Hebrew (HE)</label>
            <input type="text" dir="rtl" value={form.locationHe} onChange={(e) => f("locationHe", e.target.value)} placeholder="קטמנדו, נפאל" className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-blue-200/60 bg-blue-50/40 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-blue-900">Social Links</h3>
          <p className="text-[11px] text-gray-500">Leave any field empty to hide that icon on the public site.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Facebook URL</label>
              <input type="url" value={form.facebookUrl} onChange={(e) => f("facebookUrl", e.target.value)} placeholder="https://facebook.com/..." className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Instagram URL</label>
              <input type="url" value={form.instagramUrl} onChange={(e) => f("instagramUrl", e.target.value)} placeholder="https://instagram.com/..." className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">TikTok URL</label>
              <input type="url" value={form.tiktokUrl} onChange={(e) => f("tiktokUrl", e.target.value)} placeholder="https://tiktok.com/@..." className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
              <input type="url" value={form.linkedinUrl} onChange={(e) => f("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/..." className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Twitter / X URL</label>
              <input type="url" value={form.twitterUrl} onChange={(e) => f("twitterUrl", e.target.value)} placeholder="https://x.com/..." className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">GitHub URL</label>
              <input type="url" value={form.githubUrl} onChange={(e) => f("githubUrl", e.target.value)} placeholder="https://github.com/..." className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="rounded-xl border border-blue-200/60 bg-blue-50/40 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-blue-900">Copyright Text</h3>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">English (EN)</label>
            <input type="text" value={form.copyright} onChange={(e) => f("copyright", e.target.value)} placeholder="Matat. All rights reserved." className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hebrew (HE)</label>
            <input type="text" dir="rtl" value={form.copyrightHe} onChange={(e) => f("copyrightHe", e.target.value)} placeholder="Matat. כל הזכויות שמורות." className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>

      </div>
    </div>
  );
}

export default ManageFooter;
