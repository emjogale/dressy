const User = require("./../models/user");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllUsers = catchAsync(async (req, res) => {
  const allUsers = await User.find({}).populate("items", {
    title: 1,
    price: 1
  });

  res.status(200).json({
    status: "success",
    data: allUsers
  });
});

// const updateMe = (req, res, next) => {
//   // create error if user tries to update password
//   if (req.body.password) {
//     return next(new AppError("This route is not for password updates"), 400);
//   }
//   // update user document
//   res.status(200).json({
//     status: "success"
//   });
// };

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: user
  });
});

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yet defined"
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yet defined"
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yet defined"
  });
};
