import { useEffect, useState } from "react";
import api from "../api";
import LocationPicker from "./LocationPicker";

const radii = [5, 10, 25, 50, 100];
const ranges = [
  ["district", "Apna zila", "Bulk order sirf mere zila ke businessman ko"],
  ["state", "Poora rajya", "Bulk order mere rajya ke kisi bhi businessman ko"],
  ["india", "Poora Bharat", "Bulk order kisi bhi businessman ko, jahan bhi ho"],
];

export default function FarmerLocation() {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(null);
  const [place, setPlace] = useState(null);
  const [radius, setRadius] = useState(25);
  const [bulk, setBulk] = useState("district");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/profile/location")
      .then(({ data }) => {
        setSaved(data.place);
        setRadius(data.retailRadiusKm);
        setBulk(data.bulkRange);
      })
      .catch(() => setError("Location load nahi hui"))
      .finally(() => setReady(true));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!place) { setError("Pehle sahi pincode chuno."); return; }
    setSaving(true);
    try {
      const { data } = await api.put("/profile/location", { ...place, retailRadiusKm: radius, bulkRange: bulk });
      setSaved(data.place);
      setMsg(`Location save ho gayi: ${data.location}. Aapki sab crops ab isi location se dikhengi ✅`);
    } catch (err) {
      setError(err.response?.data?.message || "Location save nahi hui");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return <p>Loading...</p>;

  return (
    <form onSubmit={save} className="max-w-xl space-y-5 rounded-xl border bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-bold">📍 Meri location</h2>
        <p className="text-xs text-gray-500">
          Ek baar daalo, aapki sab crops isi location se dikhengi. Customer ko sirf doori dikhegi, aapka pata nahi.
        </p>
        {saved?.pincode && (
          <p className="mt-2 rounded-lg bg-green-50 p-2 text-sm text-green-800">
            Abhi saved: {saved.village || saved.area}, {saved.district}, {saved.state} ({saved.pincode})
          </p>
        )}
      </div>

      {msg && <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">{msg}</p>}
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      <LocationPicker value={saved} onChange={setPlace} />

      <div>
        <p className="mb-1 text-sm font-semibold">🛒 Customer ko delivery kitni door tak?</p>
        <div className="flex flex-wrap gap-2">
          {radii.map((r) => (
            <button key={r} type="button" onClick={() => setRadius(r)}
              className={`rounded-full border px-4 py-1 text-sm ${
                radius === r ? "border-green-700 bg-green-700 text-white" : "bg-white"
              }`}>
              {r} km
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold">📦 Businessman ko bulk delivery kahan tak?</p>
        <div className="space-y-2">
          {ranges.map(([key, title, sub]) => (
            <label key={key}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                bulk === key ? "border-green-700 bg-green-50" : ""
              }`}>
              <input type="radio" name="bulk" checked={bulk === key}
                onChange={() => setBulk(key)} className="mt-1 accent-green-700" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button disabled={saving}
        className="rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? "Save ho rahi hai..." : "Location save karo"}
      </button>
    </form>
  );
}