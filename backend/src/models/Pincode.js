const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema({
  pincode: { type: String, required: true, index: true },
  area: { type: String, required: true },      // post office / area
  district: { type: String, required: true },
  state: { type: String, required: true },
  lat: Number,
  lng: Number,
  approx: Boolean,                             // lat/lng pincode ya zila se bhari gayi
});
pincodeSchema.index({ state: 1, district: 1 });

module.exports = mongoose.model("Pincode", pincodeSchema);