const express = require("express");
const itemController = require("./../controllers/itemController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(itemController.getAllItems)
  .post(
    itemController.uploadItemImage,
    authController.protect,
    itemController.createItem
  );
router
  .route("/:id")
  .get(itemController.getItemById)
  .delete(authController.protect, itemController.deleteItem)
  .put(authController.protect, itemController.updateItem);

module.exports = router;
