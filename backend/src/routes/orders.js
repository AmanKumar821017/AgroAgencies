const router = require("express").Router();
const Order = require("../models/Order");
const Crop = require("../models/Crop");
const { deliveryError } = require("../utils/serviceability");
const { protect, allowRoles } = require("../middleware/authmiddleware");

// Order karo (businessman ya customer)
router.post("/", protect, allowRoles("businessman", "customer"), async (req, res) => {
  try {
    const { cropId, quantity, address, phone, pincode } = req.body;
    const qty = Number(quantity);
    if (!cropId || !qty || qty <= 0 || !address || !phone)
      return res.status(400).json({ message: "Sab fields sahi bharo" });

    const target = await Crop.findById(cropId).lean();
    if (!target) return res.status(400).json({ message: "Crop nahi mili" });
    
    const problem = await deliveryError([target], pincode, req.user.role);
    if (problem) return res.status(400).json({ message: problem });

    // Stock ek saath check aur kam karo (do log ek hi time order karein to galti na ho)
    const crop = await Crop.findOneAndUpdate(
      { _id: cropId, status: "available", quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      { new: true }
    );
    if (!crop)
      return res.status(400).json({ message: "Itna stock available nahi hai" });

    if (crop.quantity === 0) {
      crop.status = "soldout";
      await crop.save();
    }

    // Price: businessman ko bulk price (agar quantity kaafi ho), baaki ko retail
    const useBulk =
      req.user.role === "businessman" &&
      crop.bulkPrice &&
      crop.minBulkQty &&
      qty >= crop.minBulkQty;
    const pricePerKg = useBulk ? crop.bulkPrice : crop.retailPrice;

    const order = await Order.create({
      buyer: req.user.id,
      farmer: crop.farmer,
      crop: crop._id,
      quantity: qty,
      pricePerKg,
      totalPrice: pricePerKg * qty,
      address,
      phone,
    });

    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Mere orders (buyer)
router.get("/my", protect, allowRoles("businessman", "customer"), async (req, res) => {
  const orders = await Order.find({ buyer: req.user.id })
    .populate("crop", "name")
    .populate("farmer", "name phone")
    .sort("-createdAt");
  res.json(orders);
});

// Incoming orders (farmer)
router.get("/incoming", protect, allowRoles("farmer"), async (req, res) => {
  const orders = await Order.find({ farmer: req.user.id })
    .populate("crop", "name")
    .populate("buyer", "name phone")
    .sort("-createdAt");
  res.json(orders);
});

// Status badlo (farmer)
router.put("/:id/status", protect, allowRoles("farmer"), async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "rejected", "delivered"].includes(status))
    return res.status(400).json({ message: "Galat status" });

  const order = await Order.findOne({ _id: req.params.id, farmer: req.user.id });
  if (!order) return res.status(404).json({ message: "Order nahi mila" });

  // Reject karne par stock wapas daalo
  if (status === "rejected" && order.status === "pending") {
    await Crop.findByIdAndUpdate(order.crop, {
      $inc: { quantity: order.quantity },
      status: "available",
    });
  }

  order.status = status;
  await order.save();
  res.json(order);
});

// Cart se ek saath kai crops ka order (Pay on Delivery)
router.post("/checkout", protect, allowRoles("businessman", "customer"), async (req, res) => {
  const { items, address, phone, pincode } = req.body;
  if (!Array.isArray(items) || items.length === 0 || !address || !phone)
    return res.status(400).json({ message: "Cart, address aur phone bharo" });

  const reserved = [];
  const created = [];

  try {
    // Stock kaatne se pehle: kya har kisan is pincode par deliver karta hai?
    const found = await Crop.find({ _id: { $in: items.map((i) => i.cropId) } }).lean();
    const problem = await deliveryError(found, pincode, req.user.role);
    if (problem) return res.status(400).json({ message: problem });

    for (const it of items) {
      const qty = Number(it.quantity);
      if (!it.cropId || !qty || qty <= 0) throw new Error("Cart mein galat item hai");

      const crop = await Crop.findOneAndUpdate(
        { _id: it.cropId, status: "available", quantity: { $gte: qty } },
        { $inc: { quantity: -qty } },
        { new: true }
      );
      if (!crop) throw new Error("Ek crop ka itna stock ab nahi bacha. Cart check karo.");

      reserved.push({ id: crop._id, qty });
      if (crop.quantity === 0) {
        crop.status = "soldout";
        await crop.save();
      }

      const useBulk =
        req.user.role === "businessman" &&
        crop.bulkPrice && crop.minBulkQty && qty >= crop.minBulkQty;
      const pricePerKg = useBulk ? crop.bulkPrice : crop.retailPrice;

      const days = crop.deliveryDays || 3;
      const expectedDelivery = new Date();
      expectedDelivery.setDate(expectedDelivery.getDate() + days);

      created.push(
        await Order.create({
          buyer: req.user.id,
          farmer: crop.farmer,
          crop: crop._id,
          quantity: qty,
          pricePerKg,
          totalPrice: pricePerKg * qty,
          address,
          phone,
          paymentMethod: "COD",
          deliveryDays: days,
          expectedDelivery,
        })
      );
    }

    res.status(201).json(created);
  } catch (e) {
    for (const r of reserved) {
      await Crop.findByIdAndUpdate(r.id, { $inc: { quantity: r.qty }, status: "available" });
    }
    if (created.length) await Order.deleteMany({ _id: { $in: created.map((o) => o._id) } });
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;