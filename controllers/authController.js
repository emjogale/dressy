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

// const sendToken = (user, statusCode, res) => {

// }

exports.register = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm, role } = req.body;
  const newUser = new User({
    username: username,
    email: email,
    password: password,
    role: role,
    passwordConfirm: passwordConfirm
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
    return next(new AppError("Invalid password or email", 401));
  }
  // send token to user
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
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return next(new AppError("The user no longer exists", 401));
  }

  // if all these tests pass then grant access to protected route
  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles [admin, user]
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You are not authorized", 403));
    }
    next();
  };
};

//TODO: work on this part - need to send token to user's email address
// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   //identify user by email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new AppError("Email address not linked to a user"), 404);
//   }
//   //generate reset token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });
//   // send it to users email using sendToken
// });
exports.resetPassword = (req, res, next) => {};
