import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";

const empty = { cropName: "", quantity: "", pricePerKg: "", neededBy: "", details: "", phone: "" };
const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function BusinessRequirements() {
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [place, setPlace] = useState(null);
  const [savedPlace, setSavedPlace] = useState(null);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(sp.get("new") === "1");
  const [openId, setOpenId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/requirements/mine");
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError("Requirements load nahi hui");
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    api.get("/profile/location")
      .then(({ data }) => setSavedPlace(data.place))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    setForm((f) => ({ ...f, phone: f.phone || user?.phone || "" }));
  }, [user]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!place) { setError("Delivery ka sahi pincode chuno."); return; }
    setSaving(true);
    try {
      await api.post("/requirements", {
        cropName: form.cropName,
        quantity: Number(form.quantity),
        pricePerKg: Number(form.pricePerKg),
        neededBy: form.neededBy,
        details: form.details,
        phone: form.phone,
        ...place, // pincode, area, village
      });
      setMsg("Requirement ab farmers ko dikh rahi hai ✅");
      setForm({ ...empty, phone: form.phone });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Requirement nahi ja payi");
    } finally {
      setSaving(false);
    }
  };

  const close = async (id) => {
    if (!window.confirm("Requirement band karni hai? Farmers ko dikhna band ho jayegi.")) return;
    try { await api.put(`/requirements/${id}/close`); load(); }
    catch (err) { setError(err.response?.data?.message || "Band nahi hui"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Ye requirement delete karni hai?")) return;
    try { await api.delete(`/requirements/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || "Delete nahi hui"); }
  };

  const input = "w-full rounded-lg border p-2 text-sm outline-none focus:border-green-600";
  const label = "mb-1 block text-xs font-medium text-gray-600";

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-3 pb-24 sm:p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Meri requirements</h1>
          <p className="text-xs text-gray-500">Jo chahiye wo likho, kisan khud aapse sampark karenge</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white">
            + Nayi requirement
          </button>
        )}
      </div>

      {msg && <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">{msg}</p>}
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      {showForm && ready && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-2">
          <h2 className="font-bold sm:col-span-2">📝 Aapko kya chahiye?</h2>

          <div>
            <label className={label}>Crop ka naam</label>
            <input name="cropName" value={form.cropName} onChange={change}
              placeholder="Jaise: Gehu" className={input} required />
          </div>
          <div>
            <label className={label}>Kitna chahiye (kg)</label>
            <input name="quantity" type="number" min="1" value={form.quantity} onChange={change}
              placeholder="500" className={input} required />
          </div>
          <div>
            <label className={label}>Kitne rate tak dene ko taiyar (₹/kg)</label>
            <input name="pricePerKg" type="number" min="0" value={form.pricePerKg} onChange={change}
              placeholder="25" className={input} required />
          </div>
          <div>
            <label className={label}>Kab tak chahiye (optional)</label>
            <input name="neededBy" type="date" value={form.neededBy} onChange={change}
              min={new Date().toISOString().slice(0, 10)} className={input} />
          </div>

          <div className="sm:col-span-2">
            <p className="mb-1 text-sm font-semibold">📍 Kahan chahiye (delivery location)?</p>
            <LocationPicker value={savedPlace} onChange={setPlace} />
          </div>

          <div className="sm:col-span-2">
            <label className={label}>Aapka phone (kisan isi par call karenge)</label>
            <input name="phone" value={form.phone} inputMode="numeric" required
              pattern="[0-9]{10}" title="10 digit phone number"
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="10 digit" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Poori detail (quality, packing, payment, etc.)</label>
            <textarea name="details" value={form.details} onChange={change} rows={3}
              placeholder="Jaise: Sharbati gehu, saaf aur sukha, 50 kg ki bori, delivery par payment"
              className={input} />
          </div>

          <p className="rounded-lg bg-yellow-50 p-2 text-xs text-yellow-800 sm:col-span-2">
            🔒 Ye requirement aur aapka phone sirf farmers ko dikhega, customers ko nahi.
          </p>

          <div className="flex gap-2 sm:col-span-2">
            <button disabled={saving}
              className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? "Bhej rahe hain..." : "Farmers ko bhejo"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {list.length === 0 && !showForm && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center">
          <div className="text-4xl">📋</div>
          <p className="mt-2 font-medium">Abhi koi requirement nahi dali</p>
          <button onClick={() => setShowForm(true)}
            className="mt-3 rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white">
            + Pehli requirement dalo
          </button>
        </div>
      )}

      <div className="space-y-3">
        {list.map((r) => {
          const isOpen = r.status === "open";
          const n = r.responses?.length || 0;
          return (
            <div key={r._id} className="rounded-xl border bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.cropName} • {r.quantity} kg</p>
                  <p className="text-sm text-gray-600">
                    ₹{r.pricePerKg}/kg tak • 📍 {r.location}
                    {r.place?.state ? `, ${r.place.state}` : ""}
                    {r.neededBy ? ` • ${fmt(r.neededBy)} tak` : ""}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isOpen ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                }`}>
                  {isOpen ? "Open" : "Band"}
                </span>
              </div>
              {r.details && <p className="mt-1 text-sm text-gray-600">{r.details}</p>}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button onClick={() => setOpenId(openId === r._id ? null : r._id)}
                  className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                    n > 0 ? "bg-orange-100 text-orange-700" : "border text-gray-600"
                  }`}>
                  {n > 0 ? `🔔 ${n} kisan ne jawab diya` : "Abhi koi jawab nahi"}
                </button>
                {isOpen && (
                  <button onClick={() => close(r._id)} className="rounded-lg border px-3 py-1 text-sm">
                    Band karo
                  </button>
                )}
                <button onClick={() => remove(r._id)}
                  className="rounded-lg border border-red-600 px-3 py-1 text-sm text-red-600">
                  Delete
                </button>
              </div>

              {openId === r._id && n > 0 && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  {r.responses.map((x) => (
                    <div key={x._id} className="rounded-lg bg-gray-50 p-2 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">👨‍🌾 {x.farmer?.name}</p>
                        {x.pricePerKg != null && (
                          <p className="font-bold text-green-700">₹{x.pricePerKg}/kg</p>
                        )}
                      </div>
                      {x.farmer?.location && <p className="text-xs text-gray-500">📍 {x.farmer.location}</p>}
                      {x.message && <p className="mt-1 text-gray-700">"{x.message}"</p>}
                      <a href={`tel:${x.phone}`}
                        className="mt-2 inline-block rounded-lg bg-green-700 px-4 py-1.5 text-sm font-semibold text-white">
                        📞 Call karo • {x.phone}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}