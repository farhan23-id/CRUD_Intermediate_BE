const db = require("../config/database");

const TABLE = "users";
const PUBLIC_COLUMNS = ["id", "name", "email", "created_at", "updated_at"];

const getAllUser = () => {
  return db(TABLE).select(PUBLIC_COLUMNS);
};

const getUserById = (id) => {
  return db(TABLE).select(PUBLIC_COLUMNS).where({ id }).first();
};

const findUserByEmail = (email) => {
  return db(TABLE).where({ email }).first();
};

const createUser = async (data) => {
  const [id] = await db(TABLE).insert(data);
  return getUserById(id);
};

const updateUser = async (id, data) => {
  await db(TABLE).where({ id }).update(data);
  return getUserById(id);
};

const removeUser = (id) => {
  return db(TABLE).where({ id }).del();
};

module.exports = {
  getAllUser,
  getUserById,
  findUserByEmail,
  createUser,
  updateUser,
  removeUser,
};
