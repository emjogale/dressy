// all functions related to authentication
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const AppError = require("../utils/appError");

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  const newUser = new User({
    username: username,
    email: email,
    password: password
    // passwordConfirm: passwordConfirm
  });
  const savedUser = await newUser.save();

  const token = signToken(savedUser._id);
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: savedUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  // check this user is registered
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect password or email", 401));
  }
  // if all is correct then send token to user
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token
  });
});
