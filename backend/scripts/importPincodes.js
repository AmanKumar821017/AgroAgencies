require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { parse } = require("csv-parse/sync");
const Pincode = require("../models/Pincode");

const title = (s) =>
  String(s || "").toLowerCase().replace(/(^|[\s(\-/])([a-z])/g, (m, p, c) => p + c.toUpperCase()).trim();
const cleanArea = (s) =>
  title(String(s || "").replace(/\s+(B\.?\s?O|S\.?\s?O|H\.?\s?O|G\.?P\.?O)\.?\s*$/i, ""));
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const inIndia = (lat, lng) => lat >= 6 && lat <= 38 && lng >= 68 && lng <= 98;

async function main() {
  // .env mein jo naam hai wahi rakhna (MONGO_URI ya MONGODB_URI)
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const file = path.join(__dirname, "../data/pincode.csv");
  const rows = parse(fs.readFileSync(file), {
    columns: (h) => h.map((x) => x.trim().toLowerCase()),
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
  });

  const pick = (r, ...keys) => {
    for (const k of keys) if (r[k] != null && r[k] !== "") return r[k];
    return "";
  };

  const items = new Map();
  const sumPin = {}, sumDist = {}, sumState = {};
  const add = (o, k, lat, lng) => {
    const a = (o[k] ||= { lat: 0, lng: 0, n: 0 });
    a.lat += lat; a.lng += lng; a.n++;
  };

  for (const r of rows) {
    const pincode = String(pick(r, "pincode")).trim();
    if (!/^\d{6}$/.test(pincode)) continue;
    const district = title(pick(r, "district", "districtname"));
    const state = title(pick(r, "statename", "state"));
    const area = cleanArea(pick(r, "officename"));
    if (!district || !state || !area) continue;

    let lat = num(pick(r, "latitude"));
    let lng = num(pick(r, "longitude"));
    if (lat == null || lng == null || !inIndia(lat, lng)) lat = lng = null;

    const key = `${pincode}|${area}`;
    const cur = items.get(key);
    if (!cur) items.set(key, { pincode, area, district, state, lat, lng });
    else if (cur.lat == null && lat != null) Object.assign(cur, { lat, lng });

    if (lat != null) {
      add(sumPin, pincode, lat, lng);
      add(sumDist, `${state}|${district}`, lat, lng);
      add(sumState, state, lat, lng);
    }
  }

  const avg = (a) => a && { lat: a.lat / a.n, lng: a.lng / a.n };
  const docs = [];
  for (const d of items.values()) {
    if (d.lat == null) {
      const f = avg(sumPin[d.pincode]) || avg(sumDist[`${d.state}|${d.district}`]) || avg(sumState[d.state]);
      if (f) { d.lat = f.lat; d.lng = f.lng; d.approx = true; }
    }
    docs.push(d);
  }

  await Pincode.deleteMany({});
  for (let i = 0; i < docs.length; i += 5000) {
    await Pincode.insertMany(docs.slice(i, i + 5000), { ordered: false });
  }
  console.log(`Done: ${docs.length} areas import hue`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });