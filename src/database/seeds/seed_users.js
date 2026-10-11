const bcrypt = require("bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("users").del();

  await knex("users").insert([
    {
      name: "Budi Santoso",
      email: "budi@example.com",
      password: await bcrypt.hash("budi123", 10),
    },
    {
      name: "Siti Aminah",
      email: "siti@example.com",
      password: await bcrypt.hash("siti123", 10),
    },
    {
      name: "Joko Widodo",
      email: "joko@example.com",
      password: await bcrypt.hash("joko123", 10),
    },
  ]);
};
