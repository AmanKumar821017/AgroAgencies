import { useEffect, useState } from "react";
import api from "../api";

const empty = {
  name: "", quantity: "", retailPrice: "",
  bulkPrice: "", minBulkQty: "", location: "", deliveryDays: 3,
};

export default function FarmerCrops() {
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState(empty);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(
    new URLSearchParams(window.location.search).get("new") === "1"
  );

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/crops/mine/all");
      setCrops(Array.isArray(data) ? data : []);
    } catch {
      setError("Crops load nahi hue");
    }
  };

  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const num = (v) => (v === "" ? null : Number(v));

  const openNew = () => {
    setEditingId(null);
    setForm(empty);
    setImages([]);
    setError("");
    setMsg("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(empty);
    setImages([]);
  };

  const onFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 4) {
      setError("Maximum 4 photos hi daal sakte ho");
      e.target.value = "";
      return;
    }
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    setUploading(true);
    setError("");
    try {
      const { data } = await api.post("/upload", fd);
      setImages((prev) => [...prev, ...data.urls]);
    } catch (err) {
      setError(err.response?.data?.message || "Photo upload nahi hui");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url) => setImages(images.filter((u) => u !== url));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    const qty = Number(form.quantity);
    const payload = {
      name: form.name,
      quantity: qty,
      retailPrice: Number(form.retailPrice),
      bulkPrice: num(form.bulkPrice),
      minBulkQty: num(form.minBulkQty),
      location: form.location,
      deliveryDays: Number(form.deliveryDays) || 3,
      images,
      status: qty > 0 ? "available" : "soldout",
    };
    try {
      if (editingId) {
        await api.put(`/crops/${editingId}`, payload);
        setMsg("Crop update ho gaya ✅");
      } else {
        await api.post("/crops", payload);
        setMsg("Crop add ho gaya ✅");
      }
      closeForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Kuch galat hua");
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name,
      quantity: c.quantity,
      retailPrice: c.retailPrice,
      bulkPrice: c.bulkPrice ?? "",
      minBulkQty: c.minBulkQty ?? "",
      location: c.location ?? "",
      deliveryDays: c.deliveryDays ?? 3,
    });
    setImages(c.images || []);
    setError("");
    setMsg("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Ye crop delete karna hai?")) return;
    try {
      await api.delete(`/crops/${id}`);
      setMsg("Crop delete ho gaya");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Delete nahi hua");
    }
  };

  const input = "w-full rounded-lg border p-2 text-sm outline-none focus:border-green-600";
  const label = "mb-1 block text-xs font-medium text-gray-600";

  return (
    <div className="space-y-5 pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          Mere crops <span className="text-sm font-normal text-gray-500">({crops.length})</span>
        </h2>
        {!showForm && (
          <button
            onClick={openNew}
            className="hidden rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white sm:block"
          >
            + Nayi crop jodo
          </button>
        )}
      </div>

      {msg && <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">{msg}</p>}
      {!showForm && error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      {/* Form */}
      {showForm && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-2">
          <h3 className="text-base font-bold sm:col-span-2">
            {editingId ? "✏️ Crop edit karo" : "🌾 Naya crop add karo"}
          </h3>
          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600 sm:col-span-2">{error}</p>}

          <div>
            <label className={label}>Crop ka naam</label>
            <input name="name" placeholder="Jaise: Gehu" className={input}
              value={form.name} onChange={change} required />
          </div>
          <div>
            <label className={label}>Kitna stock hai (kg)</label>
            <input name="quantity" type="number" min="0" placeholder="500" className={input}
              value={form.quantity} onChange={change} required />
          </div>
          <div>
            <label className={label}>Retail price (₹/kg)</label>
            <input name="retailPrice" type="number" min="0" placeholder="30" className={input}
              value={form.retailPrice} onChange={change} required />
          </div>
          <div>
            <label className={label}>Location (gaon / shehar)</label>
            <input name="location" placeholder="Prayagraj" className={input}
              value={form.location} onChange={change} />
          </div>
          <div>
            <label className={label}>Bulk price (₹/kg), optional</label>
            <input name="bulkPrice" type="number" min="0" placeholder="25" className={input}
              value={form.bulkPrice} onChange={change} />
          </div>
          <div>
            <label className={label}>Bulk ke liye minimum kg, optional</label>
            <input name="minBulkQty" type="number" min="0" placeholder="100" className={input}
              value={form.minBulkQty} onChange={change} />
          </div>

          <div className="sm:col-span-2">
            <label className={label}>🚚 Delivery kitne din mein ho jayegi?</label>
            <select name="deliveryDays" value={form.deliveryDays} onChange={change} className={input}>
              <option value={1}>Agle din (1 din)</option>
              <option value={2}>2 din</option>
              <option value={3}>3 din</option>
              <option value={5}>5 din</option>
              <option value={7}>7 din</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={label}>Photos (max 4, har ek 5MB tak)</label>
            <input
              type="file" accept="image/*" multiple
              onChange={onFiles} disabled={uploading || images.length >= 4}
              className="block w-full text-sm"
            />
            {uploading && <p className="mt-1 text-sm text-gray-600">Upload ho rahi hai...</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="crop" className="h-20 w-20 rounded-lg object-cover" />
                  <button
                    type="button" onClick={() => removeImage(url)}
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-600 text-sm text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <button disabled={uploading}
              className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {editingId ? "Update karo" : "Add karo"}
            </button>
            <button type="button" onClick={closeForm} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Crops list */}
      {crops.length === 0 && !showForm && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center">
          <div className="text-4xl">🌾</div>
          <p className="mt-2 font-medium">Abhi koi crop add nahi kiya</p>
          <p className="text-sm text-gray-500">Pehli crop jodo, customer ko dikhegi.</p>
          <button onClick={openNew} className="mt-3 rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white">
            + Nayi crop jodo
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {crops.map((c) => {
          const soldout = c.status !== "available" || c.quantity <= 0;
          const low = !soldout && c.quantity <= 50;
          return (
            <div key={c._id} className="flex gap-3 rounded-xl border bg-white p-3 shadow-sm">
              {c.images?.[0] ? (
                <img src={c.images[0]} alt={c.name} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-green-50 text-3xl">🌾</div>
              )}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-semibold">{c.name}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${soldout ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                      {soldout ? "Stock khatam" : "Available"}
                    </span>
                  </div>
                  <p className="text-lg font-extrabold text-green-700">
                    ₹{c.retailPrice}<span className="text-xs font-normal text-gray-500">/kg</span>
                  </p>
                  <p className={`text-xs ${low ? "font-medium text-red-600" : "text-gray-500"}`}>
                    {soldout ? "0 kg bacha" : low ? `Sirf ${c.quantity} kg bacha` : `${c.quantity} kg stock`}
                    {" • "}🚚 {c.deliveryDays || 3} din
                  </p>
                  {c.bulkPrice ? (
                    <p className="text-xs text-yellow-700">Bulk ₹{c.bulkPrice}/kg ({c.minBulkQty} kg+)</p>
                  ) : null}
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => startEdit(c)}
                    className="rounded-lg border px-3 py-1 text-xs font-medium">
                    {soldout ? "Stock jodo" : "Edit"}
                  </button>
                  <button onClick={() => remove(c._id)}
                    className="rounded-lg border border-red-600 px-3 py-1 text-xs font-medium text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile floating button */}
      {!showForm && (
        <button
          onClick={openNew}
          className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-green-700 px-5 font-semibold text-white shadow-lg sm:hidden"
        >
          <span className="text-2xl leading-none">+</span> Crop jodo
        </button>
      )}
    </div>
  );
}