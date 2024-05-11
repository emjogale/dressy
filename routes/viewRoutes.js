const express = require("express");
const viewsController = require("./../controllers/viewsController");

const router = express.Router();

// we only use GET in the view routes
router.get("/", viewsController.getHomeView);
router.get("/item/:slug", viewsController.getItem);
router.get("/sell", viewsController.getSellForm);
router.get("/users/register", viewsController.getRegisterForm);
router.get("/users/login", viewsController.getLoginForm);
router.get("/about", viewsController.getAboutView);

module.exports = router;
