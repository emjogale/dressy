const multer = require("multer");
const AppError = require("../utils/appError");
const Item = require("./../models/item");
const User = require("./../models/user");
const catchAsync = require("./../utils/catchAsync");

const dest =
  process.env.NODE_ENV === "test" ? "tests/tempImages" : "public/assets/img";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `item-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  // test if the uploaded file is an image
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, please only upload images", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadItemImage = upload.single("img");

exports.getAllItems = catchAsync(async (req, res) => {
  const allItems = await Item.find({}).populate("user", {
    username: 1,
    email: 1
  });

  res.status(200).json({
    status: "success",
    data: allItems
  });
});

exports.getItemById = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new AppError("No item found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: item
  });
});

exports.createItem = catchAsync(async (req, res, next) => {
  const {
    title,
    desc,
    category,
    size,
    price,
    onSale,
    secretItem,
    user
  } = req.body;

  const userObj = await User.findById(req.body.user);

  const item = new Item({
    title: title,
    img: req.file.filename,
    desc: desc,
    category: category,
    size: size,
    price: price,
    onSale: onSale,
    secretItem: secretItem,
    user: user
  });

  const newItem = await item.save();

  userObj.items = userObj.items.concat(newItem._id);
  await userObj.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
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
    status: "success",
    data: {
      item: updatedItem
    }
  });
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  const { user } = req;
  const item = await Item.findById(req.params.id);

  if (!user || item.user.toString() !== user.id.toString()) {
    return next(new AppError("Operation not permitted", 401));
  }
  user.items = user.items.filter(
    thing => thing.toString() !== item.id.toString()
  );

  await user.save({ validateBeforeSave: false });
  await item.remove();

  res.status(204).json({
    status: "success",
    data: null
  });
});
