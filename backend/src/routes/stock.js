const router = require("express").Router();
const Crop = require("../models/Crop");
const { protect, allowRoles } = require("../middleware/authmiddleware");
const { nameFilter } = require("../utils/cropSynonyms");

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => res.status(500).json({ message: e.message }));

// Sirf wahi crops jinki location set hai aur stock bacha hai
function baseMatch(q) {
  const m = {
    status: "available",
    quantity: { $gt: 0 },
    "place.pincode": { $exists: true, $ne: null },
  };
  if (q.crop && q.crop.trim()) m.name = nameFilter(q.crop); // gehu = wheat, sabzi = sab sabziyan
  if (q.state) m["place.state"] = q.state;
  if (q.district) m["place.district"] = q.district;
  return m;
}

// Rajya -> Zila -> Gaon/area: har star par kitna maal, kitne kisan, kya daam
router.get("/summary", protect, allowRoles("businessman"), wrap(async (req, res) => {
  const { state, district } = req.query;
  const level = !state ? "state" : !district ? "district" : "area";

  // Bulk daam ho to wahi, warna retail
  const price = { $cond: [{ $gt: [{ $ifNull: ["$bulkPrice", 0] }, 0] }, "$bulkPrice", "$retailPrice"] };

  const rows = await Crop.aggregate([
    { $match: baseMatch(req.query) },
    {
      $group: {
        _id: `$place.${level}`,
        totalKg: { $sum: "$quantity" },
        crops: { $sum: 1 },
        farmers: { $addToSet: "$farmer" },
        minPrice: { $min: price },
        maxPrice: { $max: price },
        villages: { $addToSet: "$place.village" },
      },
    },
    {
      $project: {
        _id: 0, name: "$_id", totalKg: 1, crops: 1,
        minPrice: 1, maxPrice: 1, villages: 1, farmers: { $size: "$farmers" },
      },
    },
    { $sort: { totalKg: -1 } },
  ]);

  const out = rows
    .filter((r) => r.name)
    .map((r) => ({
      ...r,
      villages: level === "area" ? (r.villages || []).filter(Boolean).slice(0, 6) : undefined,
    }));

  const total = out.reduce(
    (t, r) => ({ totalKg: t.totalKg + r.totalKg, farmers: t.farmers + r.farmers }),
    { totalKg: 0, farmers: 0 }
  );

  res.json({ level, rows: out, total });
}));

// Kisi jagah ki crops ki list (kisan ka sirf naam, phone nahi)
router.get("/crops", protect, allowRoles("businessman"), wrap(async (req, res) => {
  const m = baseMatch(req.query);
  if (req.query.area) m["place.area"] = req.query.area;
  const list = await Crop.find(m).populate("farmer", "name").sort("-quantity").limit(60);
  res.json(list);
}));

module.exports = router;