const express = require("express");

const router = express.Router();
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
// const viewsController = require("./../controllers/viewsController");

// we only need the post function for these routes
router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.login);
router.post("/resetPassword", authController.login);

router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
