const express = require("express");
const multer = require("multer");
const itemController = require("./../controllers/itemController");

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
  .post(itemController.uploadItemImage, itemController.createItem);
router
  .route("/:id")
  .get(itemController.getItemById)
  .delete(itemController.deleteItem)
  .patch(itemController.updateItem);

module.exports = router;
