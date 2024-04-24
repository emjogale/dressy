const AppError = require('../utils/appError');
const multer = require('multer');
const Item = require('./../models/item');
const User = require('./../models/user');
const catchAsync = require('./../utils/catchAsync');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/assets/img');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `item-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  // test if the uploaded file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, please only upload images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadItemImage = upload.single('img');

exports.getAllItems = catchAsync(async (req, res) => {
  // make a shallow copy of the req.qery by destructuring
  const queryObj = { ...req.query };
  //TODO: add in exluded fields here for when we are filtering (95)

  const allItems = await Item.find(req.query);
  res.status(200).json({
    status: 'success',
    results: allItems,
    data: allItems
  });
});

exports.getItemById = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new AppError('No item found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: item
  });
});

exports.createItem = catchAsync(async (req, res, next) => {
  console.log('req file is', req.file);
  console.log('req body  is', req.body);
  const { title, desc, category, size, price, onSale, secretItem } = req.body;
  const user = await User.findById(body.userId);
  const item = new Item({
    title: title,
    img: '/assets/img/' + req.file.filename,
    desc: desc,
    category: category,
    size: size,
    price: price,
    onSale: onSale,
    secretItem: secretItem
  });
  const newItem = await item.save();
  res.status(201).json({
    status: 'success',
    data: {
      item: newItem
    }
  });
});

exports.updateItem = catchAsync(async (req, res, next) => {
  const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      item: updatedItem
    }
  });
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  await Item.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});
