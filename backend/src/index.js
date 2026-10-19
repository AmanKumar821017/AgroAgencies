require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send("API chal raha hai"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/crops", require("./routes/crops"));
app.use("/api/orders", require("./routes/orders")); 
app.use("/api/upload", require("./routes/upload"));
app.use("/api/requirements", require("./routes/requirements"));
app.use("/api/location", require("./routes/location"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/delivery", require("./routes/delivery"));
app.use("/api/stock", require("./routes/stock"));

app.listen(process.env.PORT || 5000, () =>
  console.log("Server started on port " + (process.env.PORT || 5000))
);