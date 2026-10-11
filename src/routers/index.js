const express = require("express");
const userRouter = require("./user.router");
const authRouter = require("./auth.router");

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);

module.exports = router;
