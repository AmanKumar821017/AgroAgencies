import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function deliveryText(days = 3) {
  if (days <= 1) return "Kal tak";

  const d = new Date();
  d.setDate(d.getDate() + days);

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function CropCard({ crop, delivery }) {
  const { add, dec, qtyOf } = useCart();
  const { user } = useAuth();

  const qty = qtyOf(crop._id);

  const days = crop.deliveryDays || 3;
  const outOfStock = !crop.quantity || crop.quantity <= 0;
  const lowStock = !outOfStock && crop.quantity <= 50;

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

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg">

      {/* Image */}
      <Link to={`/crops/${crop._id}`} className="relative block">
        <div className="flex h-32 items-center justify-center overflow-hidden bg-green-50 sm:h-40">

          {crop.images?.[0] ? (
            <img
              src={crop.images[0]}
              alt={crop.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-5xl">🌾</span>
          )}

        </div>

        {/* Delivery Badge */}
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-green-700 shadow">
          🚚 {days <= 1 ? "1 din" : `${days} din`}
        </span>

        {/* Out Of Stock */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded bg-gray-800 px-3 py-1 text-xs font-semibold text-white">
              Stock khatam
            </span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1 p-3">

        {/* Crop Name */}
        <Link to={`/crops/${crop._id}`}>
          <h3 className="truncate text-base font-semibold text-gray-900">
            {crop.name}
          </h3>
        </Link>

        {/* Location */}
        <p className="text-xs text-gray-500">
          📍 {crop.location || "Location nahi di"}

          {crop.farmer?.name && (
            <>
              {" • "}👨‍🌾 {crop.farmer.name}
            </>
          )}
        </p>

        {/* Price */}
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-extrabold text-green-700">
            ₹{crop.retailPrice}
          </span>

          <span className="text-xs text-gray-500">
            /kg
          </span>
        </div>

        {/* Bulk Price */}
        {hasBulk && (
          <p className="rounded bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800">
            Bulk ₹{crop.bulkPrice}/kg ({crop.minBulkQty} kg+)

            {saving > 0 && (
              <> • {saving}% bachat</>
            )}
          </p>
        )}

        {/* Stock */}
        {lowStock ? (
          <p className="text-xs font-medium text-red-600">
            Sirf {crop.quantity} kg bacha
          </p>
        ) : (
          !outOfStock && (
            <p className="text-xs text-gray-500">
              {crop.quantity} kg available
            </p>
          )
        )}

        {/* Delivery */}
        <div className="text-xs font-medium text-gray-700">
          <p>
            Delivery:{" "}
            <span className="text-green-700">
              {deliveryText(days)}
            </span>
          </p>

          {/* Delivery Available */}
          {delivery?.ok === true && (
            <p className="mt-1 text-xs font-medium text-green-700">
              ✅ Aapke pincode par delivery hogi

              {delivery.distanceKm != null &&
                ` • ${delivery.distanceKm} km door`}
            </p>
          )}

          {/* Delivery Blocked */}
          {blocked && (
            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
              ❌ Is pincode par delivery nahi
              {delivery.reason && `: kisan ${delivery.reason}`}
            </p>
          )}
        </div>

        {/* Cart Button */}
        {canBuy && (
          <div className="mt-auto pt-2">

            {/* Out Of Stock */}
            {outOfStock ? (
              <button
                disabled
                className="w-full rounded-lg bg-gray-200 py-2 text-sm font-semibold text-gray-500"
              >
                Available nahi
              </button>
            ) : blocked && qty === 0 ? (
              /* Delivery Blocked */
              <button
                disabled
                className="w-full rounded-lg bg-gray-200 py-2 text-sm font-semibold text-gray-500"
              >
                Is pincode par nahi
              </button>
            ) : qty === 0 ? (
              /* Add To Cart */
              <div className="space-y-1">

                <button
                  onClick={() => add(crop)}
                  className="w-full rounded-lg border-2 border-green-600 py-2 text-sm font-bold text-green-700 transition hover:bg-green-600 hover:text-white"
                >
                  Cart mein daalo
                </button>

                {/* Bulk Add Button */}
                {hasBulk &&
                  crop.quantity >= crop.minBulkQty &&
                  !blocked && (
                    <button
                      onClick={() =>
                        add(crop, crop.minBulkQty)
                      }
                      className="w-full rounded-lg bg-yellow-500 py-1.5 text-xs font-bold text-white transition hover:bg-yellow-600"
                    >
                      {crop.minBulkQty} kg daalo (bulk rate)
                    </button>
                  )}

              </div>
            ) : (
              /* Quantity Controls */
              <div className="flex items-center justify-between rounded-lg bg-green-600 px-2 py-1 text-white">

                <button
                  onClick={() => dec(crop._id)}
                  className="px-3 py-1 text-lg font-bold"
                >
                  −
                </button>

                <span className="text-sm font-bold">
                  {qty} kg
                </span>

                <button
                  onClick={() => add(crop)}
                  disabled={qty >= crop.quantity}
                  className="px-3 py-1 text-lg font-bold disabled:opacity-40"
                >
                  +
                </button>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}