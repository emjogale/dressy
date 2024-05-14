const express = require("express");
// const multer = require("multer");
const itemController = require("./../controllers/itemController");
const authController = require("./../controllers/authController");

const router = express.Router();

// param middleware - middleware for a specific route

// router.param("id", (req, res, next, val) => {
//   console.log(`item id is: ${val}`);
//   next();
// }); Updated to now use the checkId middleware function
// router.param("id", itemController.checkId);

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
  .delete(
    authController.protect,
    authController.restrictTo("owner"),
    itemController.deleteItem
  )
  .patch(
    authController.protect,
    authController.restrictTo("owner"),
    itemController.updateItem
  );

module.exports = router;
