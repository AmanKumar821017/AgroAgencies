const router = require("express").Router();
const Pincode = require("../models/Pincode");

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => res.status(500).json({ message: e.message }));

// 800001 -> { state, district, areas: [...] }
router.get("/pincode/:pin", wrap(async (req, res) => {
  if (!/^\d{6}$/.test(req.params.pin))
    return res.status(400).json({ message: "6 digit pincode likho" });
  const rows = await Pincode.find({ pincode: req.params.pin }).sort("area").lean();
  if (!rows.length) return res.status(404).json({ message: "Ye pincode nahi mila" });
  res.json({
    pincode: req.params.pin,
    state: rows[0].state,
    district: rows[0].district,
    areas: rows.map((r) => r.area),
  });
}));

router.get("/states", wrap(async (_req, res) => {
  const list = await Pincode.distinct("state");
  res.json(list.sort((a, b) => a.localeCompare(b)));
}));

router.get("/districts", wrap(async (req, res) => {
  if (!req.query.state) return res.status(400).json({ message: "state bhejo" });
  const list = await Pincode.distinct("district", { state: req.query.state });
  res.json(list.sort((a, b) => a.localeCompare(b)));
}));

module.exports = router;