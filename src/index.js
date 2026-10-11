const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const routes = require("./routers");

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await db.raw("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check gagal:", error.message);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
