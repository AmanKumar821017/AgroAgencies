import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const colors = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  delivered: "bg-green-100 text-green-800",
};

const labels = {
  pending: "Farmer ke jawab ka intezaar",
  accepted: "Accept ho gaya",
  rejected: "Reject ho gaya",
  delivered: "Deliver ho gaya",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders/my")
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError("Orders load nahi hue"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Mere Orders</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p>
          Abhi koi order nahi hai.{" "}
          <Link to="/" className="text-green-700 underline">Crops dekho</Link>
        </p>
      )}

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="space-y-1 rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">
                {o.crop?.name || "Crop (delete ho chuka)"} - {o.quantity} kg
              </p>
              <span className={`rounded px-2 py-0.5 text-sm ${colors[o.status]}`}>
                {o.status}
              </span>
            </div>
            <p className="text-sm text-gray-700">{labels[o.status]}</p>
            <p className="text-sm">₹{o.pricePerKg}/kg • Total ₹{o.totalPrice}</p>
            <p className="text-sm">Farmer: {o.farmer?.name} • {o.farmer?.phone || "-"}</p>
            <p className="text-sm">Delivery address: {o.address}</p>
            <p className="text-xs text-gray-500">
              {new Date(o.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}