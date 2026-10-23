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
import bg from "../assets/agro.png";

const defaults = {
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};

const promos = [
  {
    title: "Seedha kisan se",
    sub: "Bichauliye ke bina, sahi daam",
    bg: "bg-green-100",
    emoji: "👨‍🌾",
  },
  {
    title: "Bulk orders",
    sub: "Businessman ke liye khaas rate",
    bg: "bg-yellow-100",
    emoji: "📦",
  },
  {
    title: "Taaza stock",
    sub: "Khet se seedha aapke paas",
    bg: "bg-orange-100",
    emoji: "🚜",
  },
];

const relatedCategoryMap = {
  Gehu: ["Gehu", "Chawal", "Makka", "Dal", "Aloo", "Pyaz", "Tamatar", "Mirch", "Sabzi", "Masale"],

  Chawal: ["Chawal", "Gehu", "Makka", "Dal", "Aloo", "Pyaz", "Tamatar", "Sabzi", "Masale", "Mirch"],

  Makka: ["Makka", "Gehu", "Chawal", "Dal", "Aloo", "Pyaz", "Tamatar", "Mirch", "Sabzi", "Masale"],

  Aloo: ["Aloo", "Pyaz", "Tamatar", "Mirch", "Sabzi", "Makka", "Dal", "Chawal", "Gehu", "Masale"],

  Pyaz: ["Pyaz", "Aloo", "Tamatar", "Mirch", "Sabzi", "Masale", "Dal", "Gehu", "Chawal", "Makka"],

  Tamatar: ["Tamatar", "Pyaz", "Aloo", "Mirch", "Sabzi", "Masale", "Dal", "Chawal", "Gehu", "Makka"],

  Mirch: ["Mirch", "Tamatar", "Pyaz", "Aloo", "Masale", "Sabzi", "Dal", "Gehu", "Chawal", "Makka"],

  Aam: ["Aam", "Kela", "Phal", "Sabzi", "Tamatar", "Aloo", "Pyaz", "Mirch"],

  Kela: ["Kela", "Aam", "Phal", "Sabzi", "Aloo", "Pyaz", "Tamatar", "Mirch"],

  Phal: ["Phal", "Aam", "Kela", "Sabzi", "Tamatar", "Pyaz", "Aloo", "Mirch"],

  Sabzi: ["Sabzi", "Aloo", "Pyaz", "Tamatar", "Mirch", "Masale", "Dal", "Gehu", "Chawal", "Makka"],

  Dal: ["Dal", "Gehu", "Chawal", "Makka", "Aloo", "Pyaz", "Tamatar", "Mirch", "Masale", "Sabzi"],

  Masale: ["Masale", "Mirch", "Dal", "Aloo", "Pyaz", "Tamatar", "Sabzi", "Gehu", "Chawal", "Makka"],
};

function CustomerHome() {
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const showAll = searchParams.get("all") === "1";
  const isListing = search !== "" || showAll;

  const selectedCategory = categories.find(
  (c) =>
    c.name.toLowerCase() === search.toLowerCase()
);

const relatedNames =
  relatedCategoryMap[selectedCategory?.name] ||
  categories.slice(0, 10).map((c) => c.name);

const relatedCategories = relatedNames
  .map((name) =>
    categories.find(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase()
    )
  )
  .filter(Boolean)
  .slice(0, 10);

  const [filters, setFilters] = useState(defaults);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { pincode } = useDelivery();

  const { results } = useDeliveryCheck(
    crops.map((c) => c._id),
    pincode,
  );

  const set = (key) => (e) =>
    setFilters({
      ...filters,
      [key]: e.target.value,
    });

  useEffect(() => {
    if (!isListing) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = {};

        Object.entries({
          ...filters,
          search,
          location,
        }).forEach(([k, v]) => {
          if (v !== "") params[k] = v;
        });

        const { data } = await api.get("/crops", {
          params,
        });

        if (!Array.isArray(data)) {
          throw new Error("Bad response");
        }

        setCrops(data);
      } catch {
        setError("Crops load nahi hue. Backend chal raha hai?");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, search, location, isListing]);

  const input =
    "w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100";

  const hasFilters =
    JSON.stringify(filters) !== JSON.stringify(defaults);

  /* ---------------- LANDING ---------------- */
  if (!isListing) {
    return (
      <div className="mx-auto w-full max-w-7xl mt-8  space-y-6 px-3 pb-8 sm:px-4 sm:pb-10 md:px-6">

        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl">

          {/* Background */}
          <img
            src={bg}
            alt="Fresh crops from farms"
            className="h-70 w-full object-cover object-center sm:h-85 md:h-95"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Text */}
          <div className="absolute inset-0 flex items-">
            <div className="w-full max-w-2xl px-5 py-6 text-green-800 sm:px-8 sm:py-8 md:px-10">

              <p className="text-xl font-bold sm:text-2xl md:text-2xl">
                Fresh From Farms
              </p>

              <h1 className="mt-1 max-w-xl text-2xl font-extrabold leading-tight drop-shadow-sm sm:text-3xl md:text-4xl lg:text-5xl">
                Quality Crops For
                <br className="hidden sm:block" />
                 A Strong <span className="text-gray-800">Tomorrow</span>
              </h1>

              <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:gap-3">

                <Link
                  to="/?all=1"
                  className="w-fit rounded-lg bg-white px-4 py-2 text-center text-xs font-semibold text-green-700 shadow-sm transition hover:bg-gray-50 sm:px-5 sm:text-sm"
                >
                  Sabhi crops dekho
                </Link>

                <Link
                  to="/register"
                  className="w-fit rounded-lg border border-white/80 bg-black/10 px-4 py-2 text-center text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:px-5 sm:text-sm"
                >
                  Kisan ban kar becho
                </Link>

              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <h2 className="text-base font-bold sm:text-lg md:text-xl">
              Shop by Crop
            </h2>

            <Link
              to="/?all=1"
              className="text-xs font-semibold text-green-700 sm:text-sm"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.name}
                to={`/?search=${encodeURIComponent(c.name)}`}
                className="group min-w-0 text-center"
              >
                <div
                  className={`flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md sm:h-32 sm:rounded-2xl ${
                    c.bg || ""
                  }`}
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-4xl sm:text-5xl">
                      {c.emoji}
                    </span>
                  )}
                </div>

                <span className="mt-2 block truncate text-xs font-semibold text-gray-800 sm:text-sm">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base font-bold sm:text-lg md:text-xl">
              Why Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {promos.map((p) => (
              <div
                key={p.title}
                className={`group relative overflow-hidden rounded-2xl border border-white/60 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5 ${p.bg}`}
              >
                {/* Decorative Circle */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/30 transition-transform duration-300 group-hover:scale-125 sm:h-28 sm:w-28" />

                <div className="relative flex items-center justify-between gap-3 sm:gap-4">

                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-gray-900 sm:text-base md:text-lg">
                      {p.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
                      {p.sub}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70 text-2xl shadow-sm backdrop-blur transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14 sm:rounded-2xl sm:text-3xl">
                    {p.emoji}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  /* ---------------- LISTING ---------------- */
//   return (
//     <div className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-4 sm:py-4 md:px-6">

//       {/* Top Bar */}
//       <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
//         <Link
//           to="/"
//           className="text-sm font-medium text-green-700 hover:text-green-800"
//         >
//           ← Home
//         </Link>

//         <button
//           onClick={() => setShowFilters(!showFilters)}
//           className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm sm:hidden"
//         >
//           {showFilters ? "Hide Filters" : "Filters"}
//         </button>
//       </div>

//       {/* Filters */}
//       <div
//         className={`${
//           showFilters ? "grid" : "hidden"
//         } mb-4 grid-cols-1 gap-2 sm:grid sm:grid-cols-2 md:grid-cols-4`}
//       >
//         <input
//           type="number"
//           min="0"
//           value={filters.minPrice}
//           onChange={set("minPrice")}
//           placeholder="Min ₹/kg"
//           className={input}
//         />

//         <input
//           type="number"
//           min="0"
//           value={filters.maxPrice}
//           onChange={set("maxPrice")}
//           placeholder="Max ₹/kg"
//           className={input}
//         />

//         <select
//           value={filters.sort}
//           onChange={set("sort")}
//           className={input}
//         >
//           <option value="newest">Sabse naye</option>
//           <option value="priceLow">
//             Price: kam se zyada
//           </option>
//           <option value="priceHigh">
//             Price: zyada se kam
//           </option>
//           <option value="qtyHigh">
//             Zyada stock
//           </option>
//         </select>

//         <button
//           onClick={() => setFilters(defaults)}
//           disabled={!hasFilters}
//           className="rounded-lg border border-gray-200 p-2.5 text-sm transition hover:bg-gray-50 disabled:opacity-40"
//         >
//           Filters hatao
//         </button>
//       </div>

//       {/* Error */}
//       {error && (
//         <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
//           {error}
//         </p>
//       )}

//       {/* Loading */}
//       {loading && (
//         <p className="py-5 text-center text-sm text-gray-500">
//           Loading...
//         </p>
//       )}

//       {/* Results Count */}
//       {!loading && !error && (
//         <p className="mb-3 text-xs text-gray-600 sm:text-sm">
//           {search ? `"${search}" ke liye ` : ""}
//           {crops.length} crops mile
//         </p>
//       )}

//       {/* Empty */}
//       {!loading && !error && crops.length === 0 && (
//         <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-600">
//           Koi crop nahi mila. Filters badal kar dekho.
//         </div>
//       )}

//       {/* Crop Grid */}
//       <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
//         {crops.map((c) => (
//           <CropCard
//             key={c._id}
//             crop={c}
//             delivery={results[c._id]}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function Home() {
//   const { user } = useAuth();
//   const [sp] = useSearchParams();

//   const listing =
//     sp.get("search") || sp.get("all") === "1";

//   if (user?.role === "farmer") {
//     return <FarmerHome />;
//   }

//   if (user?.role === "businessman" && !listing) {
//     return <BusinessHome />;
//   }

//   return <CustomerHome />;
// }



return (
  <div className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-4 sm:py-4 md:px-6">

    

    <div className="flex gap-3 sm:gap-5">


      {/* ======================================================= */}
      {/*                    CATEGORY SIDEBAR                     */}
      {/* ======================================================= */}

      <aside className="w-19 shrink-0 sm:w-23 md:w-27">

        <div className="sticky top-3">

          <p className="mb-2 text-center text-[10px] font-bold text-gray-700 sm:text-xs">
            Categories
          </p>

          <div className="max-h-150 overflow-y-auto rounded-xl bg-gray-50 p-1 scrollbar-hide">

            {relatedCategories.slice(0, 7).map((c) => {

              const isActive =
                c.name.toLowerCase() ===
                search.toLowerCase();

              return (
                <Link
                  key={c.name}
                  to={`/?search=${encodeURIComponent(c.name)}`}
                  className={`mb-1 flex flex-col items-center rounded-lg px-1 py-2 transition-all duration-200 ${
                    isActive
                      ? "bg-white shadow-sm ring-1 ring-green-200"
                      : "hover:bg-white"
                  }`}
                >

                  {/* Category Image */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg sm:h-14 sm:w-14 md:h-16 md:w-16 ${
                      c.bg || "bg-white"
                    }`}
                  >
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="h-full w-full object-contain p-1 transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <span className="text-2xl">
                        🌾
                      </span>
                    )}
                  </div>

                  {/* Category Name */}
                  <span
                    className={`mt-1.5 line-clamp-2 text-center text-[9px] font-semibold leading-tight sm:text-[10px] ${
                      isActive
                        ? "text-green-700"
                        : "text-gray-600"
                    }`}
                  >
                    {c.name}
                  </span>

                </Link>
              );
            })}

          </div>

        </div>

      </aside>


      {/* ======================================================= */}
      {/*                      PRODUCTS                           */}
      {/* ======================================================= */}

      <main className="min-w-0 flex-1">


        {/* ================= PRODUCT HEADER ================= */}

        <div className="mb-3 flex items-center justify-between gap-2">

          <div>

            <h2 className="text-sm font-bold text-gray-900 sm:text-base">
              {search || "Fresh Crops"}
            </h2>

            {!loading && !error && (
              <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                {crops.length} products available
              </p>
            )}

          </div>


          {/* Filter + Sort */}
          <div className="flex items-center gap-1.5">

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition sm:px-3 sm:text-xs ${
                showFilters || hasFilters
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              ☷
              <span>Filter</span>

              {hasFilters && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[8px] text-white">
                  !
                </span>
              )}
            </button>


            <select
              value={filters.sort}
              onChange={set("sort")}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-gray-600 outline-none focus:border-green-500 sm:px-3 sm:text-xs"
            >
              <option value="newest">
                Newest
              </option>

              <option value="priceLow">
                Price ↑
              </option>

              <option value="priceHigh">
                Price ↓
              </option>

              <option value="qtyHigh">
                Stock ↓
              </option>
            </select>

          </div>

        </div>


        {/* ================= FILTER PANEL ================= */}

        {showFilters && (
          <div className="mb-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

              {/* Minimum Price */}
              <div>

                <label className="mb-1 block text-[10px] font-semibold text-gray-500">
                  Minimum Price
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={filters.minPrice}
                    onChange={set("minPrice")}
                    placeholder="Min price / kg"
                    className={`${input} pl-7`}
                  />

                </div>

              </div>


              {/* Maximum Price */}
              <div>

                <label className="mb-1 block text-[10px] font-semibold text-gray-500">
                  Maximum Price
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={filters.maxPrice}
                    onChange={set("maxPrice")}
                    placeholder="Max price / kg"
                    className={`${input} pl-7`}
                  />

                </div>

              </div>


              {/* Clear */}
              <div className="flex items-end">

                <button
                  onClick={() => setFilters(defaults)}
                  disabled={!hasFilters}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear Filters
                </button>

              </div>

            </div>

          </div>
        )}


        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3">

            <p className="text-xs font-medium text-red-600 sm:text-sm">
              ⚠ {error}
            </p>

          </div>
        )}


        {/* ================= LOADING ================= */}

        {loading && (
          <div className="flex min-h-63 items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />

              <p className="text-xs font-medium text-gray-500">
                Fresh crops load ho rahe hain...
              </p>

            </div>

          </div>
        )}


        {/* ================= EMPTY ================= */}

        {!loading &&
          !error &&
          crops.length === 0 && (

            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-12 text-center">

              <div className="mb-3 text-5xl">
                🌱
              </div>

              <h3 className="text-base font-bold text-gray-800">
                No crops found
              </h3>

              <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
                Try changing your search or price filters.
              </p>

              <button
                onClick={() => setFilters(defaults)}
                className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-green-700"
              >
                Clear Filters
              </button>

            </div>
          )}


        {/* ================= CROP GRID ================= */}

        {!loading &&
          !error &&
          crops.length > 0 && (

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">

              {crops.map((c) => (
                <CropCard
                  key={c._id}
                  crop={c}
                  delivery={results[c._id]}
                />
              ))}

            </div>

          )}

      </main>

    </div>

  </div>
);
}

export default function Home() {
  const { user } = useAuth();
  const [sp] = useSearchParams();

  const listing =
    sp.get("search") || sp.get("all") === "1";

  if (user?.role === "farmer") {
    return <FarmerHome />;
  }

  if (user?.role === "businessman" && !listing) {
    return <BusinessHome />;
  }

  return <CustomerHome />;
}