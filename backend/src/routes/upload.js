const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { protect, allowRoles } = require("../middleware/authmiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 }, // 5MB, max 4 photos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Sirf image file allowed hai"));
  },
});

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "agroagencies/crops",
        transformation: [{ width: 1000, crop: "limit" }, { quality: "auto" }],
      },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

router.post("/", protect, allowRoles("farmer"), (req, res) => {
  upload.array("images", 4)(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.files?.length)
      return res.status(400).json({ message: "Koi photo nahi mili" });

    try {
      const urls = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer))
      );
      res.json({ urls });
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ message: "Upload fail ho gaya" });
    }
  });
});

module.exports = router;