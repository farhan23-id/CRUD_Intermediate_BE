const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "name, email, dan password wajib diisi" });
  }

  const existing = await userModel.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "email sudah terdaftar" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({ message: "Registrasi berhasil", data: user });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email dan password wajib diisi" });
  }

  const user = await userModel.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "email atau password salah" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "email atau password salah" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );

  res.json({
    message: "login berhasil",
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
};

module.exports = { register, login };
