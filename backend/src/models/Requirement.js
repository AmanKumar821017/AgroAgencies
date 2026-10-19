const mongoose = require("mongoose");
const placeSchema = require("./placeSchema");



const responseSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pricePerKg: Number,
    message: String,
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

const requirementSchema = new mongoose.Schema(
  {
    businessman: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cropName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerKg: { type: Number, required: true, min: 0 }, // kitne rate tak dene ko taiyar
    location: { type: String, required: true },           // delivery kahan chahiye
    neededBy: Date,
    details: String,
    phone: { type: String, required: true },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    responses: [responseSchema],
    place: placeSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requirement", requirementSchema);