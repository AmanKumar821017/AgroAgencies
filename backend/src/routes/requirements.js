const router = require("express").Router();
const Requirement = require("../models/Requirement");
const { protect, allowRoles } = require("../middleware/authmiddleware");
const { buildPlace } = require("../utils/placeFromPincode");

// async errors ko 500 JSON bana deta hai
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => res.status(500).json({ message: e.message }));

// Businessman: nayi requirement
router.post("/", protect, allowRoles("businessman"), wrap(async (req, res) => {
  const { cropName, quantity, pricePerKg, pincode, area, village, neededBy, details, phone } = req.body;
  const qty = Number(quantity);
  const price = Number(pricePerKg);
  if (!cropName?.trim() || !qty || qty <= 0 || isNaN(price) || price < 0 || !phone)
    return res.status(400).json({ message: "Crop, quantity, price aur phone bharo" });

  const loc = await buildPlace(pincode, area, village);
  if (!loc) return res.status(400).json({ message: "Delivery ka sahi pincode chuno" });

  const doc = await Requirement.create({
    businessman: req.user.id,
    cropName: cropName.trim(),
    quantity: qty,
    pricePerKg: price,
    location: loc.text,
    place: loc.place,
    neededBy: neededBy || undefined,
    details,
    phone,
  });
  res.status(201).json(doc);
}));

// Businessman: apni requirements + farmers ke jawab
router.get("/mine", protect, allowRoles("businessman"), wrap(async (req, res) => {
  const list = await Requirement.find({ businessman: req.user.id })
    .populate("responses.farmer", "name phone location")
    .sort("-createdAt");
  res.json(list);
}));

// Farmer: sab open requirements (doosre kisano ke jawab nahi dikhte)
router.get("/open", protect, allowRoles("farmer"), wrap(async (req, res) => {
  const list = await Requirement.find({ status: "open" })
    .populate("businessman", "name")
    .sort("-createdAt");

  res.json(
    list.map((r) => {
      const o = r.toObject();
      o.myResponse = o.responses.find((x) => String(x.farmer) === String(req.user.id)) || null;
      o.responseCount = o.responses.length;
      delete o.responses;
      return o;
    })
  );
}));

// Farmer: "Main de sakta hoon"
router.post("/:id/respond", protect, allowRoles("farmer"), wrap(async (req, res) => {
  const { pricePerKg, message, phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number bharo" });

  const r = await Requirement.findOne({ _id: req.params.id, status: "open" });
  if (!r) return res.status(404).json({ message: "Requirement nahi mili ya band ho gayi" });

  const price = pricePerKg === "" || pricePerKg == null ? undefined : Number(pricePerKg);
  const existing = r.responses.find((x) => String(x.farmer) === String(req.user.id));
  if (existing) {
    existing.pricePerKg = price;
    existing.message = message;
    existing.phone = phone;
  } else {
    r.responses.push({ farmer: req.user.id, pricePerKg: price, message, phone });
  }
  await r.save();
  res.json({ message: "Aapka jawab businessman ko bhej diya" });
}));

// Businessman: requirement band karo
router.put("/:id/close", protect, allowRoles("businessman"), wrap(async (req, res) => {
  const r = await Requirement.findOneAndUpdate(
    { _id: req.params.id, businessman: req.user.id },
    { status: "closed" },
    { new: true }
  );
  if (!r) return res.status(404).json({ message: "Requirement nahi mili" });
  res.json(r);
}));

// Businessman: delete
router.delete("/:id", protect, allowRoles("businessman"), wrap(async (req, res) => {
  const r = await Requirement.findOneAndDelete({ _id: req.params.id, businessman: req.user.id });
  if (!r) return res.status(404).json({ message: "Requirement nahi mili" });
  res.json({ message: "Delete ho gayi" });
}));

module.exports = router;