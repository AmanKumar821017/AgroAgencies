import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return "Suprabhat";
  if (h < 17) return "Namaste";
  return "Shubh sandhya";
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export default function FarmerHome() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/orders/incoming").then((r) => r.data).catch(() => []),
      api.get("/crops/mine/all").then((r) => r.data).catch(() => []),
    ]).then(([o, c]) => {
      setOrders(Array.isArray(o) ? o : []);
      setCrops(Array.isArray(c) ? c : []);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const accepted = orders.filter((o) => o.status === "accepted").length;
  const monthEarning = orders
    .filter((o) => {
      const d = new Date(o.updatedAt);
      return o.status === "delivered" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + o.totalPrice, 0);

  const activeCrops = crops.filter((c) => c.status === "available" && c.quantity > 0).length;
  const needStock = crops.filter((c) => c.status !== "available" || c.quantity <= 50);

  const stats = [
    { label: "Naye orders", value: pendingOrders.length, emoji: "🔔", color: "bg-orange-50 text-orange-700" },
    { label: "Deliver karne hain", value: accepted, emoji: "🚚", color: "bg-blue-50 text-blue-700" },
    { label: "Bik rahi crops", value: activeCrops, emoji: "🌾", color: "bg-green-50 text-green-700" },
    {
      label: "Is mahine ki kamai",
      value: `₹${monthEarning.toLocaleString("en-IN")}`,
      emoji: "💰",
      color: "bg-yellow-50 text-yellow-800",
    },
  ];

  const actions = [
    { to: "/farmer?tab=crops&new=1", emoji: "➕", title: "Nayi crop jodo", sub: "Photo, daam aur stock daalo" },
    { to: "/farmer?tab=orders", emoji: "📦", title: "Orders dekho", sub: "Accept ya deliver karo" },
    { to: "/farmer?tab=crops", emoji: "🧺", title: "Meri crops", sub: "Edit karo, stock badhao" },
    { to: "/farmer?tab=requests", emoji: "🛒", title: "Bulk requirements", sub: "Businessman kya chahta hai" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-3 pb-10 sm:p-4">
      {/* Hero */}
      <section className="rounded-2xl bg-linear-to-r from-green-700 to-green-500 p-5 text-white sm:p-8">
        <p className="text-sm opacity-90">{greet()} 🙏</p>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{user?.name}</h1>
        <p className="mt-1 text-sm opacity-95">
          {loading
            ? "Aapka hisaab load ho raha hai..."
            : pendingOrders.length > 0
            ? `Aapke ${pendingOrders.length} naye order aaye hain, jaldi dekh lo.`
            : "Abhi koi naya order nahi. Stock aur daam check kar lo."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/farmer?tab=orders" className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-green-700">
            Orders dekho
            {pendingOrders.length > 0 && (
              <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                {pendingOrders.length}
              </span>
            )}
          </Link>
          <Link to="/farmer?tab=crops&new=1" className="rounded-lg border border-white px-5 py-2 text-sm font-semibold">
            + Nayi crop jodo
          </Link>
        </div>
      </section>

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

      {/* Quick actions */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => (
          <Link
            key={a.title}
            to={a.to}
            className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-2xl">
              {a.emoji}
            </span>
            <div>
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-gray-500">{a.sub}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Pehli crop (agar koi nahi) */}
      {!loading && crops.length === 0 && (
        <section className="rounded-xl border-2 border-dashed p-8 text-center">
          <div className="text-5xl">🌾</div>
          <p className="mt-2 font-semibold">Aapne abhi koi crop nahi jodi</p>
          <p className="text-sm text-gray-500">Pehli crop jodo, customer aur businessman ko dikhne lagegi.</p>
          <Link
            to="/farmer?tab=crops&new=1"
            className="mt-3 inline-block rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white"
          >
            + Pehli crop jodo
          </Link>
        </section>
      )}

      {/* Dhyan do: kam stock */}
      {needStock.length > 0 && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 font-bold text-red-700">⚠️ Stock check karo</h2>
          <div className="space-y-1">
            {needStock.slice(0, 4).map((c) => (
              <div key={c._id} className="flex items-center justify-between text-sm">
                <span>{c.name}</span>
                <span className="font-medium text-red-700">
                  {c.quantity > 0 ? `Sirf ${c.quantity} kg bacha` : "Stock khatam"}
                </span>
              </div>
            ))}
          </div>
          <Link to="/farmer?tab=crops" className="mt-2 inline-block text-sm font-semibold text-red-700">
            Stock badhao →
          </Link>
        </section>
      )}

      {/* Naye orders ka preview */}
      {pendingOrders.length > 0 && (
        <section className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold">Naye orders</h2>
            <Link to="/farmer?tab=orders" className="text-sm font-semibold text-green-700">
              Sabhi dekho →
            </Link>
          </div>
          <div className="divide-y">
            {pendingOrders.slice(0, 3).map((o) => (
              <div key={o._id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-semibold">{o.crop?.name} • {o.quantity} kg</p>
                  <p className="text-xs text-gray-500">
                    {o.buyer?.name}
                    {o.expectedDelivery ? ` • ${fmt(o.expectedDelivery)} tak` : ""}
                  </p>
                </div>
                <p className="font-bold">₹{o.totalPrice}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      <section className="rounded-xl bg-green-50 p-4">
        <h2 className="mb-2 font-bold text-green-800">Zyada bikri ke liye</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>📸 Saaf photo daalo, photo wali crops zyada bikti hain.</li>
          <li>🚚 Delivery ke din wahi likho jo aap sach mein de sakein.</li>
          <li>📦 Stock hamesha update rakho, taaki order cancel na ho.</li>
        </ul>
      </section>
    </div>
  );
}