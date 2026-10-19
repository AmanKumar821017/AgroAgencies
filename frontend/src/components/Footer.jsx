import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Apni asli details yahan badlo
const CONTACT = {
  phone: "+91 XXXXX XXXXX",
  email: "support@yourdomain.com",
  timing: "Subah 9 baje se shaam 7 baje tak",
};

const categories = ["Sabzi", "Phal", "Dal", "Masale", "Atta", "Anaaj"];

const roleInfo = {
  farmer: {
    tagline: "Bina bichauliye ke apni fasal seedha khareedar tak pahunchao.",
    heading: "Kisan ke liye",
    links: [
      ["Dashboard", "/farmer"],
      ["Incoming orders", "/farmer?tab=orders"],
      ["Meri crops", "/farmer?tab=crops"],
      ["Nayi crop jodo", "/farmer?tab=crops&new=1"],
      ["Businessman ki requirements", "/farmer?tab=requests"],
    ],
    tips: [
      "📸 Saaf photo daalo, zyada bikri hogi",
      "📦 Stock hamesha update rakho",
      "🚚 Delivery ke din sach likho",
      "💵 Maal dete waqt customer se paisa lo (Pay on Delivery)",
    ],
    note: "Aapki kamai seedha aapke paas, koi commission nahi.",
  },
  businessman: {
    tagline: "Bulk mein seedha kisan se kharido, mandi se kam daam par.",
    heading: "Business ke liye",
    links: [
      ["Home", "/"],
      ["Sabhi crops", "/?all=1"],
      ["Meri requirements", "/requirements"],
      ["Nayi requirement dalo", "/requirements?new=1"],
      ["Mere orders", "/my-orders"],
      ["Cart", "/cart"],
    ],
    note: "Bulk rate tab milta hai jab quantity kisan ke minimum se zyada ho.",
  },
  customer: {
    tagline: "Taaza anaaj, sabzi aur phal seedha kisan se, sahi daam par.",
    heading: "Jaldi jao",
    links: [
      ["Home", "/"],
      ["Sabhi crops", "/?all=1"],
      ["Cart", "/cart"],
    ],
    note: "Abhi sirf Pay on Delivery: maal milne par paisa do.",
  },
};

export default function Footer() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const role = user?.role === "farmer" || user?.role === "businessman" ? user.role : "customer";
  const info = roleInfo[role];

  // Role ke hisaab se kuch links login par hi
  let links = [...info.links];
  if (role === "customer") {
    if (user) links.push(["Mere orders", "/my-orders"]);
    else links.push(["Login", "/login"], ["Kisan ban kar becho", "/register"]);
  }

  // Cart ka neeche wala bar ya farmer ka floating button footer ko na dhake
  const extraPad = pathname === "/cart" || pathname.startsWith("/farmer");

  const head = "mb-3 text-sm font-bold uppercase tracking-wide text-white";
  const link = "text-sm text-gray-400 transition hover:text-green-400";

  return (
    <footer className="mt-10 bg-black text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link to="/" className="text-xl font-bold tracking-tight text-white">
            Agro<span className="text-green-400">Agencies</span>
          </Link>
          <p className="mt-3 text-sm text-gray-400">{info.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-gray-700 px-3 py-1">🌱 Seedha kisan se</span>
            <span className="rounded-full border border-gray-700 px-3 py-1">💵 Pay on Delivery</span>
          </div>
        </div>

        {/* Role ke links */}
        <div>
          <h3 className={head}>{info.heading}</h3>
          <ul className="space-y-2">
            {links.map(([label, to]) => (
              <li key={label}>
                <Link to={to} className={link}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories (kharidne wale) ya tips (farmer) */}
        <div>
          {role === "farmer" ? (
            <>
              <h3 className={head}>Zyada bikri ke liye</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {info.tips.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </>
          ) : (
            <>
              <h3 className={head}>Categories</h3>
              <ul className="space-y-2">
                {categories.map((c) => (
                  <li key={c}>
                    <Link to={`/?search=${encodeURIComponent(c)}`} className={link}>{c}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Madad */}
        <div>
          <h3 className={head}>Madad chahiye?</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              📞 <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-green-400">{CONTACT.phone}</a>
            </li>
            <li>
              ✉️ <a href={`mailto:${CONTACT.email}`} className="hover:text-green-400">{CONTACT.email}</a>
            </li>
            <li>🕘 {CONTACT.timing}</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div
          className={`mx-auto flex max-w-6xl flex-col gap-1 px-4 pt-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between ${
            extraPad ? "pb-24 lg:pb-4" : "pb-4"
          }`}
        >
          <p>© {new Date().getFullYear()} AgroAgencies. Sab adhikar surakshit.</p>
          <p>{info.note}</p>
        </div>
      </div>
    </footer>
  );
}