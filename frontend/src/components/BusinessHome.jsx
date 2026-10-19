import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import CropCard from "./CropCard";
import { categories } from "../data/Categories";
import useDeliveryCheck from "../hooks/useDeliveryCheck";
import { useDelivery } from "../context/DeliveryContext";



// bulk deals wali card


const statusBadge = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};
const statusText = {
  pending: "Kisan ke jawab ka intezaar",
  accepted: "Accepted",
  delivered: "Deliver ho gaya",
  rejected: "Reject hua",
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export default function BusinessHome() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [bulk, setBulk] = useState([]);
  const [loading, setLoading] = useState(true);
  const { pincode } = useDelivery();
  const { results } = useDeliveryCheck(bulk.map((c) => c._id), pincode);

  useEffect(() => {
    Promise.all([
      api.get("/orders/my").then((r) => r.data).catch(() => []),
      api.get("/requirements/mine").then((r) => r.data).catch(() => []),
      api.get("/crops").then((r) => r.data).catch(() => []),
    ]).then(([o, r, c]) => {
      setOrders(Array.isArray(o) ? o : []);
      setReqs(Array.isArray(r) ? r : []);
      const deals = (Array.isArray(c) ? c : [])
        .filter((x) => x.bulkPrice && x.minBulkQty && x.quantity > 0)
        .sort((a, b) => b.retailPrice - b.bulkPrice - (a.retailPrice - a.bulkPrice));
      setBulk(deals.slice(0, 4));
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const openReqs = reqs.filter((r) => r.status === "open");
  const newReplies = openReqs.reduce((s, r) => s + (r.responses?.length || 0), 0);
  const active = orders.filter((o) => ["pending", "accepted"].includes(o.status));
  const monthSpend = orders
    .filter((o) => {
      const d = new Date(o.updatedAt);
      return o.status === "delivered" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + o.totalPrice, 0);

  // Pehle kharidi hui alag-alag crops
  const past = [];
  orders.forEach((o) => {
    if (o.crop?._id && !past.find((p) => p._id === o.crop._id)) past.push(o.crop);
  });

  const stats = [
    { label: "Meri open requirements", value: openReqs.length, emoji: "📝", color: "bg-green-50 text-green-700" },
    { label: "Kisano ke jawab", value: newReplies, emoji: "🔔", color: "bg-orange-50 text-orange-700" },
    { label: "Aane wale orders", value: active.length, emoji: "🚚", color: "bg-blue-50 text-blue-700" },
    {
      label: "Is mahine ka kharcha",
      value: `₹${monthSpend.toLocaleString("en-IN")}`,
      emoji: "💰",
      color: "bg-yellow-50 text-yellow-800",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-3 pb-10 sm:p-4">
      {/* Hero */}
      <section className="rounded-2xl bg-linear-to-r from-green-700 to-green-500 p-5 text-white sm:p-8">
        <p className="text-sm opacity-90">Namaste, {user?.name} 🙏</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
          Bulk mein kharido, seedha kisan se
        </h1>
        <p className="mt-1 text-sm opacity-95">
          Jo chahiye wo requirement mein likho, kisan khud aapse sampark karenge.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/requirements?new=1" className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-green-700">
            + Requirement dalo
          </Link>
          <Link to="/?all=1" className="rounded-lg border border-white px-5 py-2 text-sm font-semibold">
            Sabhi crops dekho
          </Link>
          <Link to="/stock" className="rounded-lg border border-white px-5 py-2 text-sm font-semibold">
            📍 Zila-wise stock
          </Link>
        </div>
      </section>

      {/* Naye jawab ka alert */}
      {newReplies > 0 && (
        <Link to="/requirements"
          className="flex items-center justify-between rounded-xl border border-orange-300 bg-orange-50 p-3">
          <p className="text-sm font-semibold text-orange-800">
            🔔 {newReplies} kisan ne aapki requirement par jawab diya hai
          </p>
          <span className="text-sm font-semibold text-orange-800">Dekho →</span>
        </Link>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-3 sm:p-4 ${s.color}`}>
            <div className="text-2xl">{s.emoji}</div>
            <p className="mt-1 text-xl font-extrabold sm:text-2xl">{loading ? "–" : s.value}</p>
            <p className="text-xs font-medium opacity-80 sm:text-sm">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Categories (customer jaise) */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Kya kharidna hai?</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {categories.map((c) => (
            <Link key={c.name} to={`/?search=${encodeURIComponent(c.name)}`}
              className="flex flex-col items-center gap-1 rounded-xl bg-green-50 p-3 text-center transition hover:bg-green-100">
              <span className="text-3xl sm:text-4xl">{c.emoji}</span>
              <span className="text-xs font-medium text-gray-800 sm:text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bulk deals */}
      {bulk.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">🔥 Bulk deals</h2>
            <Link to="/?all=1" className="text-sm font-semibold text-green-700">Sabhi dekho →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {bulk.map((c) => <CropCard key={c._id} crop={c} delivery={results[c._id]} />)}
          </div>
        </section>
      )}

      {/* Aane wale orders */}
      {active.length > 0 && (
        <section className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-bold">Mere chalu orders</h2>
          <div className="divide-y">
            {active.slice(0, 3).map((o) => (
              <div key={o._id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <p className="font-semibold">{o.crop?.name} • {o.quantity} kg</p>
                  <p className="text-xs text-gray-500">
                    👨‍🌾 {o.farmer?.name}
                    {o.expectedDelivery ? ` • ${fmt(o.expectedDelivery)} tak` : ""}
                  </p>
                  {o.farmer?.phone && (
                    <a href={`tel:${o.farmer.phone}`} className="text-xs font-medium text-green-700">
                      📞 {o.farmer.phone}
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{o.totalPrice}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge[o.status]}`}>
                    {statusText[o.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pehle kharidi crops */}
      {past.length > 0 && (
        <section>
          <h2 className="mb-2 font-bold">Dobara kharido</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {past.slice(0, 8).map((c) => (
              <Link key={c._id} to={`/crops/${c._id}`}
                className="shrink-0 rounded-full border bg-white px-4 py-1.5 text-sm font-medium hover:bg-green-50">
                🌾 {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}