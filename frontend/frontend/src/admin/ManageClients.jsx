import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getClients, createClient, updateClient, deleteClient } from "../api/admin";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiEye } from "react-icons/fi";
import ImageDropzone from "./ImageDropzone";

function ManageClients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const res = await getClients();
    if (res) setClients(res);
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setLogoFile(null);
    setShowModal(true);
  };

  const openEdit = (client) => {
    setEditing(client);
    setName(client.name);
    setLogoFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("name", name);
    if (logoFile) data.append("logo", logoFile);

    let result;
    if (editing) {
      result = await updateClient(editing._id, data);
    } else {
      result = await createClient(data);
    }

    if (result) {
      await loadClients();
      setShowModal(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    const result = await deleteClient(id);
    if (result) await loadClients();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage Clients</h2>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
          <FiPlus size={16} /> Add Client
        </button>
      </div>

      {/* client logos grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {clients.map((client) => (
          <div key={client._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            {client.logo && (
              <img src={client.logo} alt={client.name} className="max-h-12 mx-auto mb-3 object-contain" />
            )}
            <p className="font-medium text-gray-800 text-sm mb-2">{client.name}</p>
            <div className="flex justify-center gap-2">
              <Link to={`/matat-admin/clients/${client._id}`} className="text-gray-500 hover:bg-gray-50 p-1.5 rounded-lg"><FiEye size={14} /></Link>
              <button onClick={() => openEdit(client)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg cursor-pointer"><FiEdit2 size={14} /></button>
              <button onClick={() => handleDelete(client._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer"><FiTrash2 size={14} /></button>
            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No clients yet.</div>
        )}
      </div>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-[2px] rounded-xl w-full max-w-md shadow-[0_4px_30px_rgba(37,99,235,0.3)] border border-blue-300">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? "Edit Client" : "Add Client"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-blue-300 shadow-[0_2px_10px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <ImageDropzone
                label="Logo"
                onFileSelect={setLogoFile}
                currentImage={editing?.logo}
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer"><FiSave size={14} /> {saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageClients;
