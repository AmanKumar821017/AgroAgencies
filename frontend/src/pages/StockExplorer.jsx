import { useEffect, useState } from "react";
import api from "../api";
import CropCard from "../components/CropCard";
import { useDelivery } from "../context/DeliveryContext";
import useDeliveryCheck from "../hooks/useDeliveryCheck";

const kg = (n) => `${Number(n).toLocaleString("en-IN")} kg`;
const priceText = (r) =>
  r.minPrice === r.maxPrice ? `₹${r.minPrice}/kg` : `₹${r.minPrice} - ₹${r.maxPrice}/kg`;
const levelTitle = { state: "Rajya chuno", district: "Zila chuno", area: "Gaon / area chuno" };

export default function StockExplorer() {
  const { pincode, place } = useDelivery();

  const [crop, setCrop] = useState("");
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [view, setView] = useState("summary"); // "summary" | "crops"
  const [sort, setSort] = useState("stock");
  const [data, setData] = useState({ level: "state", rows: [], total: null });
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  // Shuru apne zila se
  useEffect(() => {
    api.get("/profile/location")
      .then(({ data: d }) => {
        if (d.place?.state) { setState(d.place.state); setDistrict(d.place.district); }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setQ(crop.trim()), 400);
    return () => clearTimeout(t);
  }, [crop]);

  useEffect(() => {
    if (!ready) return;
    let live = true;
    setLoading(true);
    setError("");
    const params = {
      crop: q || undefined,
      state: state || undefined,
      district: district || undefined,
      area: view === "crops" ? area || undefined : undefined,
    };
    api.get(view === "crops" ? "/stock/crops" : "/stock/summary", { params })
      .then(({ data: d }) => {
        if (!live) return;
        if (view === "crops") setCrops(Array.isArray(d) ? d : []);
        else setData(d);
      })
      .catch(() => live && setError("Data load nahi hua"))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [ready, q, state, district, area, view]);

  const { results } = useDeliveryCheck(crops.map((c) => c._id), pincode);

  const toIndia = () => { setState(""); setDistrict(""); setArea(""); setView("summary"); };
  const toState = () => { setDistrict(""); setArea(""); setView("summary"); };
  const toDistrict = () => { setArea(""); setView("summary"); };

  const crumbs = [
    { label: "Poora Bharat", go: toIndia },
    state && { label: state, go: toState },
    district && { label: district, go: toDistrict },
    area && view === "crops" && { label: area, go: () => {} },
  ].filter(Boolean);

  const drill = (row) => {
    if (data.level === "state") setState(row.name);
    else if (data.level === "district") setDistrict(row.name);
    else { setArea(row.name); setView("crops"); }
  };

  const rows = [...data.rows].sort((a, b) =>
    sort === "price" ? a.minPrice - b.minPrice : b.totalKg - a.totalKg
  );

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-3 pb-10 sm:p-4">
      <div>
        <h1 className="text-xl font-bold">📍 Maal kahan hai?</h1>
        <p className="text-xs text-gray-500">Rajya se zila, zila se gaon tak dekho kitna stock aur kis daam par hai.</p>
      </div>

      <input
        value={crop}
        onChange={(e) => setCrop(e.target.value)}
        placeholder="Kaunsi crop? (gehu, wheat, sabzi, dal...)"
        className="w-full rounded-lg border p-3 text-sm outline-none focus:border-green-600"
      />

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1 text-sm">
        {crumbs.map((c, i) => (
          <span key={c.label} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-400">›</span>}
            <button onClick={c.go}
              className={i === crumbs.length - 1 ? "font-bold text-green-700" : "text-gray-600 hover:underline"}>
              {c.label}
            </button>
          </span>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {/* ----- Summary ----- */}
      {view === "summary" && !loading && (
        <>
          {data.total && rows.length > 0 && (
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-gray-600">
                {q || "Sab crops"} • {district || state || "Poora Bharat"}
              </p>
              <p className="text-2xl font-extrabold text-green-700">{kg(data.total.totalKg)}</p>
              <p className="text-sm text-gray-600">{data.total.farmers} kisan ke paas</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">{levelTitle[data.level]}</h2>
            <div className="flex gap-2">
              {state && (
                <button onClick={() => setView("crops")}
                  className="rounded-lg bg-green-700 px-3 py-1 text-sm font-semibold text-white">
                  Yahan ki sab crops dekho
                </button>
              )}
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border px-2 py-1 text-sm">
                <option value="stock">Zyada stock pehle</option>
                <option value="price">Sasta pehle</option>
              </select>
            </div>
          </div>

          {rows.length === 0 && (
            <div className="rounded-xl border-2 border-dashed p-8 text-center">
              <div className="text-4xl">🌾</div>
              <p className="mt-2 text-sm text-gray-600">Yahan abhi koi maal nahi mila.</p>
              {state && (
                <button onClick={toIndia}
                  className="mt-3 rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white">
                  Poora Bharat dekho
                </button>
              )}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {rows.map((r) => (
              <button key={r.name} onClick={() => drill(r)}
                className="rounded-xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-bold">{r.name}</p>
                  <span className="text-green-700">›</span>
                </div>
                <p className="mt-1 text-xl font-extrabold text-green-700">{kg(r.totalKg)}</p>
                <p className="text-sm text-gray-600">{r.farmers} kisan • {priceText(r)}</p>
                {r.villages?.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">Gaon: {r.villages.join(", ")}</p>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ----- Crops ----- */}
      {view === "crops" && !loading && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => { setArea(""); setView("summary"); }}
              className="text-sm font-semibold text-green-700">
              ← Summary par wapas
            </button>
            <p className="text-xs text-gray-500">
              {pincode
                ? `Delivery pincode: ${pincode}${place ? ` (${place.district})` : ""}, ✅/❌ isi par dikh raha hai`
                : "Navbar mein pincode daalo, dikhega kaun si crop wahan deliver hogi"}
            </p>
          </div>

          {crops.length === 0 && <p className="text-sm text-gray-600">Koi crop nahi mili.</p>}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {crops.map((c) => (
              <CropCard key={c._id} crop={c} delivery={results[c._id]} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}