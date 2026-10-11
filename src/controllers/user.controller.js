const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");

const getUsers = async (req, res) => {
  const users = await userModel.getAllUser();
  res.json({ data: users });
};

const getUserById = async (req, res) => {
  const user = await userModel.getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }

  res.json({ data: user });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  const user = await userModel.getUserById(id);
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }

  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (password) data.password = await bcrypt.hash(password, 10);

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: "Tidak ada data yang diubah" });
  }

  if (email) {
    const existing = await userModel.findUserByEmail(email);
    if (existing && String(existing.id) !== String(id)) {
      return res.status(409).json({ message: "Email sudah dipakai user lain" });
    }
  }

  const updated = await userModel.updateUser(id, data);
  res.json({ message: "User berhasil diubah", data: updated });
};

const deleteUser = async (req, res) => {
  const deleted = await userModel.removeUser(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }

  res.json({ message: "User berhasil dihapus" });
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
