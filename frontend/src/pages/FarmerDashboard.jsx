import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FarmerCrops from "../components/FarmerCrops";
import FarmerOrders from "../components/FarmerOrders.jsx";
import FarmerRequirements from "../components/FarmerRequirements";
import FarmerLocation from "../components/FarmerLocation";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const t = sp.get("tab");
  const [tab, setTab] = useState(["crops", "requests", "location"].includes(t) ? t : "orders");
  const [orders, setOrders] = useState([]);
  const [hasLocation, setHasLocation] = useState(true);

  const loadOrders = () =>
    api
      .get("/orders/incoming")
      .then(({ data }) => Array.isArray(data) && setOrders(data))
      .catch(() => {});

  useEffect(() => { loadOrders(); }, [tab]);

  // Tab badalne par dobara check, taaki location save hote hi banner hat jaye
  useEffect(() => {
    api.get("/profile/location")
      .then(({ data }) => setHasLocation(!!data.place?.pincode))
      .catch(() => {});
  }, [tab]);

  const now = new Date();
  const pending = orders.filter((o) => o.status === "pending").length;
  const accepted = orders.filter((o) => o.status === "accepted").length;
  const monthEarning = orders
    .filter((o) => {
      const d = new Date(o.updatedAt);
      return o.status === "delivered" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + o.totalPrice, 0);

  const stats = [
    { label: "Naye orders", value: pending, color: "bg-orange-50 text-orange-700", emoji: "🔔" },
    { label: "Deliver karne hain", value: accepted, color: "bg-blue-50 text-blue-700", emoji: "🚚" },
    { label: "Is mahine ki kamai", value: `₹${monthEarning.toLocaleString("en-IN")}`, color: "bg-green-50 text-green-700", emoji: "💰" },
  ];

  const tabClass = (name) =>
    `relative shrink-0 px-4 py-2 font-medium ${
      tab === name ? "border-b-2 border-green-700 text-green-700" : "text-gray-600"
    }`;

  return (
    <div className="mx-auto max-w-4xl p-3 sm:p-4">
      <h1 className="text-2xl font-bold">Namaste, {user?.name} 🙏</h1>
      <p className="mb-4 text-sm text-gray-500">Aapka farmer dashboard</p>

      {!hasLocation && tab !== "location" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-300 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-700">
            📍 Apni location daalo, tabhi customer ko aapki crop nazdeek ke hisaab se dikhegi.
          </p>
          <button onClick={() => setTab("location")}
            className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white">
            Location daalo
          </button>
        </div>
      )}

      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-3 sm:p-4 ${s.color}`}>
            <div className="text-xl sm:text-2xl">{s.emoji}</div>
            <p className="mt-1 text-lg font-extrabold sm:text-2xl">{s.value}</p>
            <p className="text-[11px] font-medium opacity-80 sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex overflow-x-auto border-b">
        <button className={tabClass("orders")} onClick={() => setTab("orders")}>
          Incoming Orders
          {pending > 0 && (
            <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{pending}</span>
          )}
        </button>
        <button className={tabClass("crops")} onClick={() => setTab("crops")}>Mere Crops</button>
        <button className={tabClass("requests")} onClick={() => setTab("requests")}>Requirements</button>
        <button className={tabClass("location")} onClick={() => setTab("location")}>Meri Location</button>
      </div>

      {tab === "orders" ? (
        <FarmerOrders onChange={loadOrders} />
      ) : tab === "crops" ? (
        <FarmerCrops />
      ) : tab === "requests" ? (
        <FarmerRequirements />
      ) : (
        <FarmerLocation />
      )}
    </div>
  );
}