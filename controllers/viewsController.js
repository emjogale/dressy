const Item = require("../models/item");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const loggedIn = true;

exports.getHomeView = catchAsync(async (req, res) => {
  // get item data
  const items = await Item.find({});
  res.status(200).render("index", { loggedIn: loggedIn, items: items });
});
exports.getAboutView = catchAsync(async (req, res) => {
  res.status(200).render("about", { loggedIn: loggedIn });
});

// Display detail of specific item
exports.getItem = catchAsync(async (req, res, next) => {
  const item = await Item.findOne({ slug: req.params.slug });
  console.log("item is", item);
  if (!item) {
    return next(new AppError("There is no item with that name", 404));
  }
  res
    .status(200)
    .render("item", { loggedIn: loggedIn, item: item, errors: null });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", { loggedIn: loggedIn, errors: null });
};

exports.getSellForm = (req, res) => {
  res.status(200).render("sell", { loggedIn: loggedIn, errors: null });
};

exports.getRegisterForm = (req, res) => {
  res.status(200).render("register", { loggedIn: loggedIn, errors: null });
};
