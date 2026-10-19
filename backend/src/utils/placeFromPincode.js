const Pincode = require("../models/Pincode");

// pincode + area + gaon -> { place, text }
async function buildPlace(pincode, area, village) {
  if (!/^\d{6}$/.test(String(pincode || ""))) return null;
  const rows = await Pincode.find({ pincode: String(pincode) }).lean();
  if (!rows.length) return null;
  const row = rows.find((r) => r.area === area) || rows[0];

  const place = {
    pincode: row.pincode,
    state: row.state,
    district: row.district,
    area: row.area,
    village: String(village || "").trim().slice(0, 60),
  };
  if (row.lat != null && row.lng != null) {
    place.point = { type: "Point", coordinates: [row.lng, row.lat] };
  }
  const text = [place.village || place.area, place.district].filter(Boolean).join(", ");
  return { place, text };
}

module.exports = { buildPlace };