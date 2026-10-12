const express = require("express");
const userController = require("../controllers/user.controller");
const {
  authenticate,
  authorizeSelf,
} = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { updateUserSchema } = require("../validators/user.validator");

const router = express.Router();

router.use(authenticate);

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.patch(
  "/:id",
  authorizeSelf,
  validate(updateUserSchema),
  userController.updateUser,
);
router.delete("/:id", authorizeSelf, userController.deleteUser);

module.exports = router;
