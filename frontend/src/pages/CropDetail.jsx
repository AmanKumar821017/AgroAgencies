import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function CropDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [crop, setCrop] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ quantity: "", address: "", phone: "" });
  const [msg, setMsg] = useState("");
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    api.get(`/crops/${id}`)
      .then((r) => setCrop(r.data))
      .catch(() => setError("Crop nahi mila"));
  }, [id]);

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!crop) return <p className="p-6">Loading...</p>;

  const qty = Number(form.quantity) || 0;
  const useBulk =
    user?.role === "businessman" &&
    crop.bulkPrice &&
    crop.minBulkQty &&
    qty >= crop.minBulkQty;
  const price = useBulk ? crop.bulkPrice : crop.retailPrice;

  const canOrder = user && ["customer", "businessman"].includes(user.role);

  const submit = async (e) => {
    e.preventDefault();
    setOrderError("");
    setMsg("");
    try {
      await api.post("/orders", {
        cropId: crop._id,
        quantity: qty,
        address: form.address,
        phone: form.phone,
      });
      setMsg("Order ho gaya! Farmer jald hi aapse contact karega (cash on delivery).");
      setTimeout(() => navigate("/my-orders"), 1200);
    } catch (err) {
      setOrderError(err.response?.data?.message || "Order nahi ho paya");
    }
  };

  const input = "w-full rounded border p-2";

  return (
    <div className="mx-auto grid max-w-5xl gap-8 p-4 md:grid-cols-2">
      <div className="flex h-72 items-center justify-center overflow-hidden rounded-lg bg-green-100">
        {crop.images?.[0] ? (
          <img src={crop.images[0]} alt={crop.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-7xl">🌾</span>
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{crop.name}</h1>
        <p className="text-xl font-bold text-green-700">₹{crop.retailPrice}/kg</p>
        {crop.bulkPrice && (
          <p className="text-gray-700">
            Bulk: ₹{crop.bulkPrice}/kg ({crop.minBulkQty} kg ya zyada, businessman ke liye)
          </p>
        )}
        <p>Available: {crop.quantity} kg</p>
        <p>Location: {crop.location || "-"}</p>
        <p>Farmer: {crop.farmer?.name}</p>

        <hr className="my-4" />

        {crop.status === "soldout" || crop.quantity === 0 ? (
          <p className="font-semibold text-red-600">Sold out</p>
        ) : !user ? (
          <p>
            Order karne ke liye <Link to="/login" className="text-green-700 underline">login</Link> karo.
          </p>
        ) : !canOrder ? (
          <p className="text-gray-600">Farmer account se order nahi ho sakta.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <h2 className="text-xl font-semibold">Order karo</h2>
            {msg && <p className="text-green-700">{msg}</p>}
            {orderError && <p className="text-red-600">{orderError}</p>}
            <input
              type="number" min="1" max={crop.quantity}
              placeholder="Quantity (kg)" className={input}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <input
              placeholder="Delivery address" className={input}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
            <input
              placeholder="Phone" className={input}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            {qty > 0 && (
              <p className="font-semibold">
                Total: ₹{price * qty} (₹{price}/kg {useBulk && "- bulk price"})
              </p>
            )}
            <button className="w-full rounded bg-green-700 p-2 text-white">Order karo</button>
          </form>
        )}

        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-gray-600 underline">
          ← Wapas
        </button>
      </div>
    </div>
  );
}