const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: "Crop", required: true },
    quantity: { type: Number, required: true },
    pricePerKg: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "delivered"],
      default: "pending",
    },

    // naye fields
    paymentMethod: { type: String, enum: ["COD"], default: "COD" },
    deliveryDays: { type: Number, default: 3 },
    expectedDelivery: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);