const User = require("./../models/user");
const catchAsync = require("./../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res) => {
  const allUsers = await User.find({}).populate("items", {
    title: 1,
    price: 1
  });

  res.status(200).json({
    status: "success",
    results: allUsers,
    data: allUsers
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yet defined"
  });
};
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
