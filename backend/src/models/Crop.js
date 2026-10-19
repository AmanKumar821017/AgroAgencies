const mongoose = require("mongoose");
const placeSchema = require("./placeSchema");


const cropSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },        // kg mein
    retailPrice: { type: Number, required: true },     // per kg
    bulkPrice: Number,                                 // per kg
    minBulkQty: Number,                                // itne kg se bulk price
    location: String,
    images: [String],
    status: { type: String, enum: ["available", "soldout"], default: "available" },
    place: placeSchema,
    retailRadiusKm: Number,
    bulkRange: String,

  },
  { timestamps: true }
);

cropSchema.index({ "place.point": "2dsphere" });

// Nayi crop banate hi kisan ki profile wali location apne aap copy ho jaye
cropSchema.pre("save", async function () {
  if (!this.isNew) return;
  const farmer = await mongoose.model("User").findById(this.farmer)
    .select("place retailRadiusKm bulkRange").lean();
  if (farmer?.place?.pincode) {
    this.place = farmer.place;
    this.retailRadiusKm = farmer.retailRadiusKm;
    this.bulkRange = farmer.bulkRange;
    this.location = [farmer.place.village || farmer.place.area, farmer.place.district]
      .filter(Boolean).join(", ");
  }
});

module.exports = mongoose.model("Crop", cropSchema);