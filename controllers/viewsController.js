const Item = require('../models/item');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

loggedIn = true;

exports.getHomeView = catchAsync(async (req, res) => {
  // get item data
  const items = await Item.find({});
  res.status(200).render('index', { loggedIn: loggedIn, items: items });
});

// Display detail of specific item
exports.getItem = catchAsync(async (req, res, next) => {
  const item = await Item.findOne({ slug: req.params.slug });
  console.log('item is', item);
  if (!item) {
    return next(new AppError('There is no item with that name', 404));
  }
  res.status(200).render('item', { item: item, errors: null });
});

exports.getSellForm = (req, res) => {
  res.status(200).render('sell', { loggedIn: loggedIn, errors: null });
};
