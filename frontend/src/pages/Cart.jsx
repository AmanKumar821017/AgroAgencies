import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useDelivery } from "../context/DeliveryContext";
import useDeliveryCheck from "../hooks/useDeliveryCheck";
import api from "../api";
import { categories } from "../data/Categories";

const DELIVERY_FREE_ABOVE = 500;
const DELIVERY_FEE = 40;

// Backend crop name -> Categories.js name
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

function dateText(days = 3) {
  const d = new Date();
  d.setDate(d.getDate() + days);

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function Cart() {
  const { items, add, dec, remove, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    city: "",
    fullAddress: "",
    pincode: "",
  });

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const { pincode: savedPin, setPincode } = useDelivery();

  const { results, dest, error: delError } = useDeliveryCheck(
    items.map((i) => i._id),
    address.pincode
  );

  const blocked = items.filter(
    (i) => results[i._id]?.ok === false
  );

  // Navbar ka pincode cart ke address mein bhar do
  // jab tak address pincode khaali ho
  useEffect(() => {
    if (savedPin) {
      setAddress((a) =>
        a.pincode
          ? a
          : {
              ...a,
              pincode: savedPin,
            }
      );
    }
  }, [savedPin]);

  // Saved address load karo
  useEffect(() => {
    let saved = {};

    try {
      saved =
        JSON.parse(localStorage.getItem("address")) || {};
    } catch {
      saved = {};
    }

    setAddress({
      name: saved.name || user?.name || "",
      phone: saved.phone || user?.phone || "",
      city: saved.city || user?.location || "",
      fullAddress:
        saved.fullAddress || user?.address || "",
      pincode: saved.pincode || "",
    });
  }, [user]);

  const setField = (k) => (e) =>
    setAddress({
      ...address,
      [k]: e.target.value,
    });

  const addressOk =
    address.name.trim() &&
    /^\d{10}$/.test(address.phone) &&
    address.city.trim() &&
    address.fullAddress.trim() &&
    /^\d{6}$/.test(address.pincode);

  const deliveryFee =
    total === 0 || total >= DELIVERY_FREE_ABOVE
      ? 0
      : DELIVERY_FEE;

  const grand = total + deliveryFee;

  const slowest = items.length
    ? Math.max(
        ...items.map((i) => i.deliveryDays || 3)
      )
    : 3;

  const saveAddress = () => {
    if (!addressOk) {
      setError(
        "Naam, 10 digit phone, sheher, 6 digit pincode aur poora pata bharo."
      );
      return;
    }

    setError("");

    localStorage.setItem(
      "address",
      JSON.stringify(address)
    );

    // Address ka pincode DeliveryContext mein save karo
    setPincode(address.pincode);

    setEditing(false);
  };

  const placeOrder = async () => {
    if (!user) return navigate("/login");

    if (!addressOk) {
      setEditing(true);
      setError("Pehle delivery address poora bharo.");
      return;
    }

    // Current address pincode ko delivery context mein save karo
    setPincode(address.pincode);

    // Agar koi crop deliver nahi ho sakti to order mat karo
    if (blocked.length) {
      setError(
        "Kuch crops is pincode par deliver nahi hoti. Pincode badlo ya unhe cart se hata do."
      );
      return;
    }

    // Delivery check mein error hai
    if (delError) {
      setError(delError);
      return;
    }

    setPlacing(true);
    setError("");

    try {
      localStorage.setItem(
        "address",
        JSON.stringify(address)
      );

      await api.post("/orders/checkout", {
        items: items.map((i) => ({
          cropId: i._id,
          quantity: i.qty,
        })),

        address: `${address.fullAddress}, ${address.city}${
          address.pincode
            ? " - " + address.pincode
            : ""
        }`,

        phone: address.phone,
        pincode: address.pincode,
      });

      clear();
      navigate("/my-orders");
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Order nahi ho paya. Dobara try karo."
      );
    } finally {
      setPlacing(false);
    }
  };

  // Khaali cart
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <div className="text-6xl">🛒</div>

        <h1 className="mt-3 text-xl font-bold">
          Aapka cart khaali hai
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Taaza crops dekho aur cart mein daalo.
        </p>

        <Link
          to="/?all=1"
          className="mt-5 inline-block rounded-lg bg-green-600 px-6 py-2 font-semibold text-white"
        >
          Crops dekho
        </Link>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border p-2 text-sm outline-none focus:border-green-600";

  return (
    <div className="mx-auto max-w-6xl p-3 pb-28 sm:p-4 lg:pb-4">
      <h1 className="mb-3 text-xl font-bold">
        Mera Cart{" "}
        <span className="text-sm font-normal text-gray-500">
          ({items.length} crops)
        </span>
      </h1>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-4 lg:col-span-2">

          {/* Delivery Address */}
          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <h2 className="font-bold">
                📍 Delivery address
              </h2>

              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm font-semibold text-green-700"
                >
                  Badlo
                </button>
              )}
            </div>

            {!editing ? (
              addressOk ? (
                <div className="mt-2 text-sm text-gray-700">
                  <p className="font-semibold">
                    {address.name} • {address.phone}
                  </p>

                  <p>
                    {address.fullAddress},{" "}
                    {address.city} {address.pincode}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-2 rounded-lg border-2 border-dashed border-green-600 px-4 py-2 text-sm font-semibold text-green-700"
                >
                  + Delivery address jodo
                </button>
              )
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  value={address.name}
                  onChange={setField("name")}
                  placeholder="Naam"
                  className={input}
                />

                <input
                  value={address.phone}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      phone: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    })
                  }
                  placeholder="Phone (10 digit)"
                  inputMode="numeric"
                  className={input}
                />

                <input
                  value={address.city}
                  onChange={setField("city")}
                  placeholder="Sheher / Location"
                  className={input}
                />

                <input
                  value={address.pincode}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      pincode: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6),
                    })
                  }
                  placeholder="Pincode"
                  inputMode="numeric"
                  className={input}
                />

                <textarea
                  value={address.fullAddress}
                  onChange={setField("fullAddress")}
                  placeholder="Poora pata (ghar no., gali, landmark)"
                  rows={2}
                  className={`${input} sm:col-span-2`}
                />

                <div className="flex gap-2 sm:col-span-2">
                  <button
                    onClick={saveAddress}
                    className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white"
                  >
                    Save karo
                  </button>

                  {addressOk && (
                    <button
                      onClick={() => {
                        setEditing(false);
                        setError("");
                      }}
                      className="rounded-lg border px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Destination district/state */}
            {dest && (
              <p className="mt-1 text-xs text-green-700">
                📍 {dest.district}, {dest.state}
              </p>
            )}

            {/* Delivery API error */}
            {delError && (
              <p className="mt-1 text-xs text-red-600">
                {delError}
              </p>
            )}
          </section>

          {/* Cart Items */}
          <section className="rounded-xl border bg-white shadow-sm">
            {items.map((i) => {
              // ------------------------------------
              // Category image find karo
              // ------------------------------------
              const categoryName =
                categoryMap[
                  i.name?.trim().toLowerCase()
                ] || i.name;

              const category = categories.find(
                (c) =>
                  c.name.toLowerCase() ===
                  categoryName?.toLowerCase()
              );

              return (
                <div
                  key={i._id}
                  className="flex gap-3 border-b p-3 last:border-b-0"
                >
                  {/* CATEGORY IMAGE */}
                  <Link
                    to={`/crops/${i._id}`}
                    className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg ${
                      category?.bg || "bg-green-50"
                    } sm:h-24 sm:w-24`}
                  >
                    {category?.image ? (
                      <img
                        src={category.image}
                        alt={i.name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-3xl">
                        🌾
                      </span>
                    )}
                  </Link>

                  {/* ITEM DETAILS */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between gap-2">
                        <h3 className="font-semibold">
                          {i.name}
                        </h3>

                        <p className="font-bold">
                          ₹{i.qty * i.price}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        ₹{i.price}/kg
                      </p>

                      <p className="text-xs text-green-700">
                        🚚 Delivery:{" "}
                        {dateText(i.deliveryDays)}
                      </p>

                      {/* Farmer delivery failure */}
                      {results[i._id]?.ok === false && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          ❌ Kisan{" "}
                          {results[i._id].reason}
                        </p>
                      )}
                    </div>

                    {/* QUANTITY */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg bg-green-600 text-white">
                        <button
                          onClick={() => dec(i._id)}
                          className="px-3 py-1 text-lg font-bold"
                        >
                          −
                        </button>

                        <span className="min-w-14 text-center text-sm font-bold">
                          {i.qty} kg
                        </span>

                        <button
                          onClick={() =>
                            add({
                              _id: i._id,
                              name: i.name,
                              retailPrice: i.price,
                              images: [i.image],
                              quantity: i.stock,
                              deliveryDays:
                                i.deliveryDays,
                            })
                          }
                          disabled={i.qty >= i.stock}
                          className="px-3 py-1 text-lg font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => remove(i._id)}
                        className="text-xs font-medium text-red-600"
                      >
                        Hatao
                      </button>
                    </div>

                    {i.qty >= i.stock && (
                      <p className="mt-1 text-xs text-red-600">
                        Itna hi stock hai ({i.stock} kg)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        {/* RIGHT: BILL + PAYMENT */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-20">

          {/* Bill */}
          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-bold">
              Bill
            </h2>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Crops ka total
                </span>

                <span>₹{total}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Delivery charge
                </span>

                <span
                  className={
                    deliveryFee === 0
                      ? "font-medium text-green-700"
                      : ""
                  }
                >
                  {deliveryFee === 0
                    ? "FREE"
                    : `₹${deliveryFee}`}
                </span>
              </div>

              {deliveryFee > 0 && (
                <p className="rounded bg-yellow-50 p-2 text-xs text-yellow-800">
                  ₹{DELIVERY_FREE_ABOVE - total} aur
                  kharido, delivery free ho jayegi
                </p>
              )}

              <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold">
                <span>Kul rakam</span>
                <span>₹{grand}</span>
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Sab ki delivery:{" "}
              {dateText(slowest)} tak
            </p>
          </section>

          {/* Payment */}
          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-bold">
              Payment
            </h2>

            <label className="flex items-center gap-3 rounded-lg border-2 border-green-600 bg-green-50 p-3">
              <input
                type="radio"
                checked
                readOnly
                className="accent-green-600"
              />

              <div>
                <p className="text-sm font-semibold">
                  💵 Pay on Delivery
                </p>

                <p className="text-xs text-gray-600">
                  Maal milne par cash ya UPI se do
                </p>
              </div>
            </label>

            <p className="mt-2 text-xs text-gray-400">
              Online payment jald aayega
            </p>
          </section>

          {/* Error */}
          {error && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Blocked crops warning */}
          {blocked.length > 0 && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <p className="font-semibold">
                ❌ Delivery available nahi
              </p>

              <p className="mt-1 text-xs">
                {blocked.length} crop
                {blocked.length > 1 ? "s" : ""} aapke
                pincode par deliver nahi ho sakta.
              </p>

              <p className="mt-1 text-xs">
                Crop hatao ya delivery pincode badlo.
              </p>
            </div>
          )}

          {/* Desktop Order Button */}
          <button
            onClick={placeOrder}
            disabled={
              placing || blocked.length > 0
            }
            className="hidden w-full rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 lg:block"
          >
            {blocked.length > 0
              ? "Delivery available nahi"
              : placing
              ? "Order ho raha hai..."
              : `Order karo • ₹${grand}`}
          </button>
        </aside>
      </div>

      {/* Mobile Sticky Order Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t bg-white p-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] lg:hidden">
        <div>
          <p className="text-xs text-gray-500">
            Kul rakam
          </p>

          <p className="text-lg font-extrabold">
            ₹{grand}
          </p>
        </div>

        <button
          onClick={placeOrder}
          disabled={
            placing || blocked.length > 0
          }
          className="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          {blocked.length > 0
            ? "Delivery available nahi"
            : placing
            ? "Ho raha hai..."
            : "Order karo (COD)"}
        </button>
      </div>
    </div>
  );
}