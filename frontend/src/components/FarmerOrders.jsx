import { useEffect, useState } from "react";
import api from "../api";

const badge = {
  pending: { cls: "bg-yellow-100 text-yellow-800", text: "Naya order" },
  accepted: { cls: "bg-blue-100 text-blue-800", text: "Accepted" },
  rejected: { cls: "bg-red-100 text-red-800", text: "Reject kiya" },
  delivered: { cls: "bg-green-100 text-green-800", text: "Deliver ho gaya" },
};

const filters = [
  { key: "all", label: "Sabhi" },
  { key: "pending", label: "Naye" },
  { key: "accepted", label: "Deliver karne hain" },
  { key: "done", label: "Ho gaye" },
];

const order = { pending: 0, accepted: 1, delivered: 2, rejected: 3 };

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export default function FarmerOrders({ onChange }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/orders/incoming");
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError("Orders load nahi hue");
    }
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    if (status === "rejected" && !window.confirm("Ye order reject karna hai? Stock wapas jud jayega.")) return;
    setBusy(id);
    setError("");
    try {
      await api.put(`/orders/${id}/status`, { status });
      await load();
      onChange?.(); // dashboard ke stats update
    } catch (err) {
      setError(err.response?.data?.message || "Status update nahi hua");
    } finally {
      setBusy(null);
    }
  };

  const shown = orders
    .filter((o) =>
      filter === "all" ? true :
      filter === "done" ? ["delivered", "rejected"].includes(o.status) :
      o.status === filter
    )
    .sort((a, b) => order[a.status] - order[b.status] || new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">
        Incoming orders <span className="text-sm font-normal text-gray-500">({orders.length})</span>
      </h2>

      {/* Filter chips */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full border px-3 py-1 text-sm ${
              filter === f.key ? "border-green-700 bg-green-700 text-white" : "bg-white text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      {shown.length === 0 && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center">
          <div className="text-4xl">📭</div>
          <p className="mt-2 text-sm text-gray-600">
            {orders.length === 0 ? "Abhi koi order nahi aaya." : "Is filter mein koi order nahi."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {shown.map((o) => {
          const b = badge[o.status] || badge.pending;
          const dueDate = o.expectedDelivery
            ? fmt(o.expectedDelivery)
            : fmt(new Date(new Date(o.createdAt).getTime() + (o.deliveryDays || 3) * 86400000));
          return (
            <div
              key={o._id}
              className={`space-y-2 rounded-xl border bg-white p-3 shadow-sm ${
                o.status === "pending" ? "border-yellow-400" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{o.crop?.name || "Crop"} • {o.quantity} kg</p>
                  <p className="text-xs text-gray-500">
                    ₹{o.pricePerKg}/kg • {new Date(o.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${b.cls}`}>
                  {b.text}
                </span>
              </div>

              <div className="rounded-lg bg-gray-50 p-2 text-sm">
                <p className="font-medium">👤 {o.buyer?.name}</p>
                <p className="text-gray-700">📍 {o.address}</p>
                <a href={`tel:${o.phone}`} className="font-medium text-green-700">📞 {o.phone}</a>
              </div>

              <div className="flex items-center justify-between text-sm">
                <p>🚚 Delivery: <b>{dueDate}</b> tak</p>
                <p className="text-lg font-extrabold">₹{o.totalPrice}</p>
              </div>

              <p className="rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-800">
                💵 Pay on Delivery: maal dete waqt ₹{o.totalPrice} lena hai
              </p>

              {o.status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <button
                    disabled={busy === o._id}
                    onClick={() => setStatus(o._id, "accepted")}
                    className="flex-1 rounded-lg bg-green-700 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    ✓ Accept
                  </button>
                  <button
                    disabled={busy === o._id}
                    onClick={() => setStatus(o._id, "rejected")}
                    className="flex-1 rounded-lg border border-red-600 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
              {o.status === "accepted" && (
                <button
                  disabled={busy === o._id}
                  onClick={() => setStatus(o._id, "delivered")}
                  className="w-full rounded-lg bg-green-700 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  🚚 Delivered mark karo
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}