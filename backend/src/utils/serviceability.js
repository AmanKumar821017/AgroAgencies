const Pincode = require("../models/Pincode");

const toRad = (d) => (d * Math.PI) / 180;

function distanceKm(lat1, lng1, lat2, lng2) {
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// Delivery pincode -> { state, district, lat, lng }
async function getDestination(pincode) {
  if (!/^\d{6}$/.test(String(pincode || ""))) return null;
  const rows = await Pincode.find({ pincode: String(pincode) }).lean();
  if (!rows.length) return null;
  const geo = rows.filter((r) => r.lat != null && r.lng != null);
  return {
    state: rows[0].state,
    district: rows[0].district,
    lat: geo.length ? geo.reduce((s, r) => s + r.lat, 0) / geo.length : null,
    lng: geo.length ? geo.reduce((s, r) => s + r.lng, 0) / geo.length : null,
  };
}

// Kya ye kisan (crop) is jagah deliver karta hai?
function checkDelivery(crop, dest, role) {
  const p = crop.place;
  if (!p?.pincode) return { ok: true }; // kisan ne abhi location nahi daali

  if (role === "businessman") {
    const range = crop.bulkRange || "district";
    if (range === "india") return { ok: true };
    if (range === "state") {
      return p.state === dest.state
        ? { ok: true }
        : { ok: false, reason: `sirf ${p.state} rajya mein bulk bhejta hai` };
    }
    return p.state === dest.state && p.district === dest.district
      ? { ok: true }
      : { ok: false, reason: `sirf ${p.district} zila mein bulk bhejta hai` };
  }

  // customer: radius (km)
  const radius = crop.retailRadiusKm || 25;
  const [lng, lat] = p.point?.coordinates || [];
  if (lat == null || dest.lat == null) return { ok: true };
  const d = distanceKm(lat, lng, dest.lat, dest.lng);
  return d <= radius
    ? { ok: true, distanceKm: d }
    : { ok: false, reason: `sirf ${radius} km tak deliver karta hai (aap lagbhag ${Math.round(d)} km door ho)` };
}

// Pehli galti ka message deta hai, sab theek ho to null
async function deliveryError(crops, pincode, role) {
  const dest = await getDestination(pincode);
  if (!dest) return "Delivery ka sahi 6 digit pincode bharo";
  for (const c of crops) {
    const chk = checkDelivery(c, dest, role);
    if (!chk.ok) return `${c.name}: kisan ${chk.reason}. Is crop ko cart se hata do.`;
  }
  return null;
}

module.exports = { getDestination, checkDelivery, deliveryError, distanceKm };