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
exports.getItemDetail = catchAsync(async (req, res, next) => {
  //   console.log('we are in the get specific item function');
  //   const item = await Item.findById(req.params.id);
  //   res.render('item', { item });
  res.send('route not implemented yet');
});

exports.getSellForm = (req, res) => {
  res.status(200).render('sell', { loggedIn: loggedIn, errors: null });
};
