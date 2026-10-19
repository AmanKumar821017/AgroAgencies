const mongoose = require("mongoose");
const placeSchema = require("./placeSchema");




const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["farmer", "businessman", "customer"],
      default: "customer",
      place: placeSchema,
      retailRadiusKm: { type: Number, default: 25 },
      bulkRange: { type: String, enum: ["district", "state", "india"], default: "district" },

    },
  },
  { timestamps: true }
);

userSchema.index({ "place.point": "2dsphere" });


module.exports = mongoose.model("User", userSchema);