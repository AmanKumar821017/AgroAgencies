const router = require("express").Router();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const Crop = require("../models/Crop");
const { protect, allowRoles } = require("../middleware/authmiddleware");
const { nameFilter } = require("../utils/cropSynonyms"); // file ke upar


// Sabke liye: list + search (?search=wheat)
router.get("/", async (req, res) => {
  try {
    const { search, location, minPrice, maxPrice, sort } = req.query;
    const filter = { status: "available" };


    // route ke andar
    if (search && search.trim()) filter.name = nameFilter(search);
    if (location) filter.location = { $regex: escapeRegex(location), $options: "i" };

    const min = Number(minPrice);
    const max = Number(maxPrice);
    if ((minPrice && !isNaN(min)) || (maxPrice && !isNaN(max))) {
      filter.retailPrice = {};
      if (minPrice && !isNaN(min)) filter.retailPrice.$gte = min;
      if (maxPrice && !isNaN(max)) filter.retailPrice.$lte = max;
    }

    const sorts = {
      newest: "-createdAt",
      priceLow: "retailPrice",
      priceHigh: "-retailPrice",
      qtyHigh: "-quantity",
    };

    const crops = await Crop.find(filter)
      .populate("farmer", "name phone")
      .sort(sorts[sort] || "-createdAt");

    res.json(crops);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Ek crop
router.get("/:id", async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate("farmer", "name phone");
    if (!crop) return res.status(404).json({ message: "Crop nahi mila" });
    res.json(crop);
  } catch {
    res.status(404).json({ message: "Crop nahi mila" });
  }
});

// Sirf farmer: add
router.post("/", protect, allowRoles("farmer"), async (req, res) => {
  try {
    const crop = await Crop.create({ ...req.body, farmer: req.user.id });
    res.status(201).json(crop);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Farmer ke apne crops
router.get("/mine/all", protect, allowRoles("farmer"), async (req, res) => {
  res.json(await Crop.find({ farmer: req.user.id }).sort("-createdAt"));
});

// Sirf apna crop edit
router.put("/:id", protect, allowRoles("farmer"), async (req, res) => {
  try {
    const { farmer, _id, ...data } = req.body;
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      data,
      { new: true, runValidators: true }
    );
    if (!crop) return res.status(404).json({ message: "Crop nahi mila" });
    res.json(crop);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Sirf apna crop delete
router.delete("/:id", protect, allowRoles("farmer"), async (req, res) => {
  const crop = await Crop.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
  if (!crop) return res.status(404).json({ message: "Crop nahi mila" });
  res.json({ message: "Delete ho gaya" });
});

module.exports = router;