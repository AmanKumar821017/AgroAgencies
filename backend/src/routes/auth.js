const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const makeToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Sab fields bharo" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email pehle se registered hai" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashed, role });

    res.status(201).json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Email ya password galat hai" });

    res.json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;