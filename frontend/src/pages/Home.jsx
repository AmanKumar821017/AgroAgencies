import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
import FarmerHome from "../components/FarmerHome";
import { useAuth } from "../context/AuthContext";
import CropCard from "../components/CropCard";
import { categories } from "../data/Categories";
import BusinessHome from "../components/BusinessHome";
import useDeliveryCheck from "../hooks/useDeliveryCheck";
import { useDelivery } from "../context/DeliveryContext";



const defaults = { minPrice: "", maxPrice: "", sort: "newest" };

// const categories = [
//   { name: "Gehu", emoji: "🌾" },
//   { name: "Chawal", emoji: "🍚" },
//   { name: "Makka", emoji: "🌽" },
//   { name: "Aloo", emoji: "🥔" },
//   { name: "Pyaz", emoji: "🧅" },
//   { name: "Tamatar", emoji: "🍅" },
//   { name: "Sarson", emoji: "🌼" },
//   { name: "Dal", emoji: "🫘" },
//   { name: "Ganna", emoji: "🎋" },
//   { name: "Mirch", emoji: "🌶️" },
//   { name: "Aam", emoji: "🥭" },
//   { name: "Kela", emoji: "🍌" },
// ];

const promos = [
  { title: "Seedha kisan se", sub: "Bichauliye ke bina, sahi daam", bg: "bg-green-100", emoji: "👨‍🌾" },
  { title: "Bulk orders", sub: "Businessman ke liye khaas rate", bg: "bg-yellow-100", emoji: "📦" },
  { title: "Taaza stock", sub: "Khet se seedha aapke paas", bg: "bg-orange-100", emoji: "🚜" },
];

 function CustomerHome() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const showAll = searchParams.get("all") === "1";
  const isListing = search !== "" || showAll;

  const [filters, setFilters] = useState(defaults);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { pincode } = useDelivery();
const { results } = useDeliveryCheck(crops.map((c) => c._id), pincode);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  useEffect(() => {
    if (!isListing) return; // landing par API call nahi

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        Object.entries({ ...filters, search, location }).forEach(([k, v]) => {
          if (v !== "") params[k] = v;
        });
        const { data } = await api.get("/crops", { params });
        if (!Array.isArray(data)) throw new Error("Bad response");
        setCrops(data);
      } catch {
        setError("Crops load nahi hue. Backend chal raha hai?");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, search, location, isListing]);

  const input = "w-full rounded border p-2 text-sm";
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(defaults);

  /* ---------------- LANDING (Blinkit jaisa) ---------------- */
  if (!isListing) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-3 pb-10 sm:p-4">
        {/* Hero banner */}
        <section className="overflow-hidden rounded-2xl bg-linear-to-r from-green-700 to-green-500 p-6 text-white sm:p-10">
          <p className="text-sm font-medium opacity-90">Kisan se seedha aapke ghar tak</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-4xl">
            Taaza anaaj, sahi daam,<br />bina kisi bichauliye ke
          </h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/?all=1"
              className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-green-700"
            >
              Sabhi crops dekho
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-white px-5 py-2 text-sm font-semibold"
            >
              Kisan ban kar becho
            </Link>
          </div>
        </section>

        {/* Promo cards */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {promos.map((p) => (
            <div key={p.title} className={`flex items-center justify-between rounded-xl p-4 ${p.bg}`}>
              <div>
                <p className="font-bold text-gray-900">{p.title}</p>
                <p className="text-sm text-gray-600">{p.sub}</p>
              </div>
              <span className="text-4xl">{p.emoji}</span>
            </div>
          ))}
        </section>

        {/* Category tiles */}
        <section>
          <h2 className="mb-3 text-lg font-bold">Kya kharidna hai?</h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
            {categories.map((c) => (
              <Link
                key={c.name}
                to={`/?search=${encodeURIComponent(c.name)}`}
                className="flex flex-col items-center gap-1 rounded-xl bg-green-50 p-3 text-center transition hover:bg-green-100"
              >
                <span className="text-3xl sm:text-4xl">{c.emoji}</span>
                <span className="text-xs font-medium text-gray-800 sm:text-sm">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Kaise kaam karta hai */}
        <section className="rounded-xl border p-4">
          <h2 className="mb-3 text-lg font-bold">Kaise kaam karta hai</h2>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <p>🔍 <b>Search karo</b><br />Apni pasand ki crop dhoondho</p>
            <p>🛒 <b>Cart mein daalo</b><br />Kisan ka daam aur stock dekho</p>
            <p>🚚 <b>Order karo</b><br />Seedha kisan se delivery</p>
          </div>
        </section>
      </div>
    );
  }

  /* ---------------- LISTING (search ke baad) ---------------- */
  return (
    <div className="mx-auto max-w-6xl p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <Link to="/" className="text-sm text-green-700">← Home</Link>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="rounded border px-3 py-1 text-sm sm:hidden"
        >
          Filters
        </button>
      </div>

      <div className={`${showFilters ? "grid" : "hidden"} mb-4 grid-cols-2 gap-2 sm:grid sm:grid-cols-4`}>
        <input type="number" min="0" value={filters.minPrice} onChange={set("minPrice")}
          placeholder="Min ₹/kg" className={input} />
        <input type="number" min="0" value={filters.maxPrice} onChange={set("maxPrice")}
          placeholder="Max ₹/kg" className={input} />
        <select value={filters.sort} onChange={set("sort")} className={input}>
          <option value="newest">Sabse naye</option>
          <option value="priceLow">Price: kam se zyada</option>
          <option value="priceHigh">Price: zyada se kam</option>
          <option value="qtyHigh">Zyada stock</option>
        </select>
        <button
          onClick={() => setFilters(defaults)}
          disabled={!hasFilters}
          className="rounded border p-2 text-sm disabled:opacity-40"
        >
          Filters hatao
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && (
        <p className="mb-3 text-sm text-gray-600">
          {search ? `"${search}" ke liye ` : ""}{crops.length} crops mile
        </p>
      )}
      {!loading && !error && crops.length === 0 && (
        <p>Koi crop nahi mila. Filters badal kar dekho.</p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {crops.map((c) => (
          <CropCard key={c._id} crop={c} delivery={results[c._id]} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const listing = sp.get("search") || sp.get("all") === "1";

  if (user?.role === "farmer") return <FarmerHome />;
  if (user?.role === "businessman" && !listing) return <BusinessHome />;
  return <CustomerHome />;
}