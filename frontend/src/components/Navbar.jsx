import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useDelivery } from "../context/DeliveryContext";

const Icon = ({ children, className = "h-6 w-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { pincode, setPincode, place } = useDelivery();
  const isFarmer = user?.role === "farmer";
  const isBusiness = user?.role === "businessman";
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();

  const [openMenu, setOpenMenu] = useState(null); // "loc" | "profile" | null
  const wrapRef = useRef(null);

  const search = params.get("search") || "";

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const update = (key, value) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    navigate({ pathname: "/", search: p.toString() }, { replace: pathname === "/" });
  };

  const item = "flex items-center gap-1 text-white hover:text-green-400";
  const menuLink = "block px-3 py-2 text-sm text-gray-800 hover:bg-gray-100";
  const pill =
    "rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-500";

  return (
    <header className="sticky top-0 z-50 bg-black">
      <div
        ref={wrapRef}
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 sm:px-4"
      >
        <Link to="/" className="text-xl font-bold tracking-tight text-white">
          Agro<span className="text-green-400">Agencies</span>
        </Link>

        {!isFarmer && (
          <div className="order-3 flex w-full overflow-hidden rounded bg-white md:order-0 md:w-auto md:flex-1">
            <input
              value={search}
              onChange={(e) => update("search", e.target.value)}
              placeholder="Crop search karo (wheat, gehu, sabzi...)"
              className="w-full px-3 py-2 text-sm outline-none"
            />
            <span className="flex items-center bg-green-600 px-3 text-white">
              <Icon className="h-5 w-5">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </Icon>
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-4">
          {isFarmer && <Link to="/farmer" className={pill}>Dashboard</Link>}
          {isBusiness && <Link to="/requirements" className={pill}>Requirement</Link>}

          {/* Delivery pincode */}
          {!isFarmer && (
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === "loc" ? null : "loc")}
                className={item}
              >
                <Icon>
                  <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
                  <circle cx="12" cy="10" r="2.5" />
                </Icon>
                <span className="hidden max-w-32 truncate text-sm lg:inline">
                  {pincode
                    ? place ? `${pincode} • ${place.district}` : pincode
                    : "Pincode"}
                </span>
              </button>

              {openMenu === "loc" && (
                <div className="absolute right-0 mt-2 w-64 rounded bg-white p-3 shadow-lg">
                  <p className="mb-1 text-xs text-gray-500">Delivery ka pincode</p>
                  <input
                    autoFocus
                    value={pincode}
                    inputMode="numeric"
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && setOpenMenu(null)}
                    placeholder="6 digit pincode"
                    className="w-full rounded border p-2 text-sm"
                  />
                  {pincode.length === 6 && (
                    place
                      ? <p className="mt-2 text-sm font-medium text-green-700">📍 {place.district}, {place.state}</p>
                      : <p className="mt-2 text-xs text-red-600">Ye pincode nahi mila</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Alag jagah ka pincode daalo, crops par dikhega wahan deliver hogi ya nahi.
                  </p>
                  <div className="mt-2 flex justify-between text-sm">
                    <button
                      onClick={() => { setPincode(""); setOpenMenu(null); }}
                      className="text-gray-500"
                    >
                      Hatao
                    </button>
                    <button onClick={() => setOpenMenu(null)} className="font-medium text-green-700">
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}
              className={item}
            >
              <Icon>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </Icon>
              <span className="hidden max-w-25 truncate text-sm lg:inline">
                {user ? user.name : "Profile"}
              </span>
            </button>

            {openMenu === "profile" && (
              <div
                className="absolute right-0 mt-2 w-48 overflow-hidden rounded bg-white shadow-lg"
                onClick={() => setOpenMenu(null)}
              >
                {!user ? (
                  <>
                    <Link to="/login" className={menuLink}>Login</Link>
                    <Link to="/register" className={menuLink}>Register</Link>
                  </>
                ) : (
                  <>
                    <p className="border-b px-3 py-2 text-xs text-gray-500">
                      {user.name} ({user.role})
                    </p>
                    {isFarmer && <Link to="/farmer" className={menuLink}>Dashboard</Link>}
                    {isBusiness && <Link to="/requirements" className={menuLink}>Meri Requirements</Link>}
                    {isBusiness && <Link to="/stock" className={menuLink}>Zila-wise stock</Link>}
                    {!isFarmer && <Link to="/my-orders" className={menuLink}>Mere Orders</Link>}
                    <button
                      onClick={() => { logout(); navigate("/login"); }}
                      className={`${menuLink} w-full text-left text-red-600`}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          {!isFarmer && (
            <Link to="/cart" className={`${item} relative`}>
              <Icon>
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M2 3h3l2.6 12.4a1 1 0 001 .8h9.7a1 1 0 001-.8L21 7H6" />
              </Icon>
              <span className="hidden text-sm lg:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-xs font-bold text-black">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}