import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { categories } from "../data/Categories";

function deliveryText(days = 3) {
  if (days <= 1) return "Tomorrow";

  const d = new Date();
  d.setDate(d.getDate() + days);

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/* Backend crop name -> Categories.js name */
const categoryMap = {
  wheat: "Gehu",
  rice: "Chawal",
  corn: "Makka",
  maize: "Makka",
  potato: "Aloo",
  onion: "Pyaz",
  tomato: "Tamatar",
  chilli: "Mirch",
  chili: "Mirch",
  mango: "Aam",
  banana: "Kela",
  fruits: "Phal",
  fruit: "Phal",
  vegetables: "Sabzi",
  vegetable: "Sabzi",
  spices: "Masale",
  spice: "Masale",
  pulses: "Dal",
  pulse: "Dal",
  dal: "Dal",
};

export default function CropCard({ crop, delivery }) {
  const { add, dec, qtyOf } = useCart();
  const { user } = useAuth();

  const qty = qtyOf(crop._id);

  const days = crop.deliveryDays || 3;

  const outOfStock =
    !crop.quantity || crop.quantity <= 0;

  const lowStock =
    !outOfStock && crop.quantity <= 50;

  const canBuy = user?.role !== "farmer";

  const blocked = delivery?.ok === false;

  const isBiz = user?.role === "businessman";

  const hasBulk =
    isBiz &&
    crop.bulkPrice &&
    crop.minBulkQty;

  const saving = hasBulk
    ? Math.round(
        (1 - crop.bulkPrice / crop.retailPrice) * 100
      )
    : 0;

  /* Find category */
  const mappedCategoryName =
    categoryMap[crop.name?.trim().toLowerCase()] ||
    crop.name;

  const category = categories.find(
    (c) =>
      c.name.toLowerCase() ===
      mappedCategoryName?.toLowerCase()
  );

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-200 hover:shadow-md">

      {/* ================= IMAGE ================= */}
      <Link
        to={`/crops/${crop._id}`}
        className="relative block"
      >
        <div
          className={`relative flex h-36 items-center justify-center overflow-hidden ${
            category?.bg || "bg-green-50"
          }`}
        >
          {category?.image ? (
            <img
              src={category.image}
              alt={crop.name}
              className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-5xl">🌾</span>
          )}

          {/* Delivery */}
          <div className="absolute left-2 top-2 rounded-md bg-white px-2 py-1 shadow-sm">
            <p className="text-[9px] font-bold leading-none text-gray-800">
              🚚 {days <= 1 ? "1 day" : `${days} days`}
            </p>
          </div>

          {/* Bulk Badge */}
          {hasBulk && (
            <div className="absolute right-2 top-2 rounded-md bg-yellow-400 px-2 py-1">
              <p className="text-[9px] font-bold text-yellow-900">
                BULK
              </p>
            </div>
          )}

          {/* Out of Stock */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="rounded-md bg-gray-800 px-3 py-1 text-xs font-bold text-white">
                Out of stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ================= CONTENT ================= */}
      <div className="flex flex-1 flex-col p-3">

        {/* Delivery Time */}
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          {deliveryText(days)}
        </p>

        {/* Crop Name */}
        <Link to={`/crops/${crop._id}`}>
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {crop.name}
          </h3>
        </Link>

        {/* Quantity */}
        <p className="mt-0.5 text-[11px] text-gray-500">
          1 kg
        </p>

        {/* Location */}
        <p className="mt-1 truncate text-[10px] text-gray-400">
          📍 {crop.location || "Location not available"}
        </p>

        {/* Price + Add */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">

          <div>
            <div className="flex items-center gap-1">
              <span className="text-base font-bold text-gray-900">
                ₹{crop.retailPrice}
              </span>

              <span className="text-[10px] text-gray-400">
                /kg
              </span>
            </div>

            {hasBulk && (
              <p className="mt-0.5 text-[9px] font-medium text-green-600">
                ₹{crop.bulkPrice}/kg bulk
              </p>
            )}
          </div>

          {/* ================= ADD BUTTON ================= */}
          {canBuy && (
            <>
              {outOfStock ? (
                <button
                  disabled
                  className="rounded-md border border-gray-300 bg-gray-100 px-4 py-1.5 text-xs font-bold text-gray-400"
                >
                  ADD
                </button>
              ) : blocked && qty === 0 ? (
                <button
                  disabled
                  className="rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-400"
                >
                  NOT AVAILABLE
                </button>
              ) : qty === 0 ? (
                <button
                  onClick={() => add(crop)}
                  className="rounded-md border border-green-600 bg-white px-5 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-600 hover:text-white"
                >
                  ADD
                </button>
              ) : (
                <div className="flex items-center overflow-hidden rounded-md bg-green-600 text-white">
                  <button
                    onClick={() => dec(crop._id)}
                    className="px-2.5 py-1 text-sm font-bold hover:bg-green-700"
                  >
                    −
                  </button>

                  <span className="min-w-7 text-center text-xs font-bold">
                    {qty}
                  </span>

                  <button
                    onClick={() => add(crop)}
                    disabled={qty >= crop.quantity}
                    className="px-2.5 py-1 text-sm font-bold hover:bg-green-700 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Low Stock */}
        {lowStock && (
          <p className="mt-2 text-[10px] font-medium text-red-500">
            Only {crop.quantity} kg left
          </p>
        )}

        {/* Delivery Check */}
        {delivery?.ok === true && (
          <p className="mt-2 text-[10px] font-medium text-green-600">
            ✓ Delivery available at your pincode
          </p>
        )}

        {blocked && (
          <p className="mt-2 rounded bg-red-50 px-2 py-1 text-[9px] font-medium text-red-600">
            Delivery unavailable at this pincode
          </p>
        )}

        {/* Bulk Saving */}
        {hasBulk && saving > 0 && (
          <p className="mt-2 text-[9px] font-semibold text-green-600">
            🎉 Save {saving}% on bulk orders
          </p>
        )}
      </div>
    </div>
  );
}