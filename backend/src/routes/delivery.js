const router = require("express").Router();
const mongoose = require("mongoose");
const Crop = require("../models/Crop");
const { getDestination, checkDelivery } = require("../utils/serviceability");

// Sirf jaankari ke liye. Asli rok-tok checkout par hoti hai.
router.post("/check", async (req, res) => {
  try {
    const { pincode, cropIds, role } = req.body;
    const dest = await getDestination(pincode);
    if (!dest) return res.status(404).json({ message: "Ye pincode nahi mila" });

    const ids = (Array.isArray(cropIds) ? cropIds : [])
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .slice(0, 100);
    const crops = await Crop.find({ _id: { $in: ids } })
      .select("name place bulkRange retailRadiusKm")
      .lean();

    const who = role === "businessman" ? "businessman" : "customer";
    const results = {};
    for (const c of crops) {
      const chk = checkDelivery(c, dest, who);
      results[c._id] = {
        ok: chk.ok,
        reason: chk.reason,
        distanceKm: chk.distanceKm != null ? Math.round(chk.distanceKm) : undefined,
      };
    }
    res.json({ destination: { state: dest.state, district: dest.district }, results });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;