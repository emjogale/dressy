const Item = require('../models/item');
const catchAsync = require('../utils/catchAsync');

loggedIn = true;

exports.getHomeView = catchAsync(async (req, res) => {
  // get item data
  const items = await Item.find({});
  console.log('items are', items);
  res.status(200).render('index', { loggedIn: loggedIn, items: items });
});

// Display detail of specific item
exports.getItem = catchAsync(async (req, res, next) => {
  const item = await Item.findOne({ slug: req.params.slug });
  console.log('item is', item);

  res.render('item', { item: item });
  res.status(200).render('item', { errors: null });
});

exports.getSellForm = (req, res) => {
  res.status(200).render('sell', { loggedIn: loggedIn, errors: null });
};
