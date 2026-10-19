const router = require("express").Router();
const User = require("../models/User");
const Crop = require("../models/Crop");
const Pincode = require("../models/Pincode");
const { protect } = require("../middleware/authmiddleware");

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => res.status(500).json({ message: e.message }));

// Apni saved location
router.get("/location", protect, wrap(async (req, res) => {
  const u = await User.findById(req.user.id).select("place retailRadiusKm bulkRange").lean();
  res.json({
    place: u?.place || null,
    retailRadiusKm: u?.retailRadiusKm ?? 25,
    bulkRange: u?.bulkRange || "district",
  });
}));

// Location save (sab roles). State, zila aur lat/lng server khud nikalta hai
router.put("/location", protect, wrap(async (req, res) => {
  const { pincode, area, village, retailRadiusKm, bulkRange } = req.body;
  if (!/^\d{6}$/.test(String(pincode)))
    return res.status(400).json({ message: "Sahi 6 digit pincode bharo" });

  const rows = await Pincode.find({ pincode: String(pincode) }).lean();
  if (!rows.length) return res.status(404).json({ message: "Ye pincode nahi mila" });
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
  const locText = [place.village || place.area, place.district].filter(Boolean).join(", ");

  const user = await User.findById(req.user.id).select("role");
  const set = { place, location: locText };

  if (user.role === "farmer") {
    const r = Number(retailRadiusKm);
    set.retailRadiusKm = [5, 10, 25, 50, 100].includes(r) ? r : 25;
    set.bulkRange = ["district", "state", "india"].includes(bulkRange) ? bulkRange : "district";
  }
  await User.findByIdAndUpdate(req.user.id, { $set: set });

  // Kisan ki purani aur nayi, sab crops isi location par
  if (user.role === "farmer") {
    await Crop.updateMany(
      { farmer: req.user.id },
      { $set: { place, location: locText, retailRadiusKm: set.retailRadiusKm, bulkRange: set.bulkRange } }
    );
  }

  res.json({ place, location: locText, retailRadiusKm: set.retailRadiusKm, bulkRange: set.bulkRange });
}));

module.exports = router;