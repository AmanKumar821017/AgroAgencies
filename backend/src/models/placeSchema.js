const mongoose = require("mongoose");

module.exports = new mongoose.Schema(
  {
    pincode: String,
    state: String,
    district: String,
    area: String,
    village: String, // kisan ka likha gaon ka naam (optional)
    point: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number], default: undefined }, // [lng, lat]
    },
  },
  { _id: false }
);