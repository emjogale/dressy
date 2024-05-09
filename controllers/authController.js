const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const AppError = require("../utils/appError");

const getTokenFrom = req => {
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

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
  // use the correctPassword checker defined in the user model
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid password or email", 401));
  }
  // if all is correct then send token to user
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    username: user.username,
    id: user._id
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // get the token check if it exists
  const token = getTokenFrom(req);
  if (!token) {
    return next(new AppError("You are not authorized", 401));
  }
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // check if user still exists
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return next(new AppError("The user no longer exists", 401));
  }
  // TODO: check if user changed password after the token was issued

  // if all these tests pass then grant access to protected route
  req.user = user;
  next();
});
