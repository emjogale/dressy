const AppError = require("./../utils/appError");

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleJsonWebTokenError = () => {
  const message = `Invalid token please log in again`;
  return new AppError(message, 401);
};
const handleTokenExpiredError = () => {
  const message = `Token expired - please log in again`;
  return new AppError(message, 401);
};

const handleDuplicateFieldsDB = err => {
  const value = err.message.match(/([""])(\\?.)*?\1/)[0];
  //1. API
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  //1. API

  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      msg: err.message,
      stack: err.stack
    });
  }
  //2. RENDERED WEBSITE
  console.error("dev stage 3 error handling: ERROR! 😨", err);
  return res.status(err.statusCode).render("notFound", {
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  //1. API
  if (req.originalUrl.startsWith("/api")) {
    // operational error send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        msg: err.message
      });
    }
    // programming or other unkown error - don"t leak details
    console.error("ERROR! 😨", err);
  }
  //2. RENDERED WEBSITE
  // operational error send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render("notFound", {
      status: err.status,
      msg: err.message
    });
  }
  //log the error
  console.error("ERROR! 😨");

  // send generic message
  return res.status(err.statusCode).render("notFound", {
    status: err.status,
    msg: "please try again later"
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test"
  ) {
    // make a shallow copy of the err object and add in name and message fields
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    else if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    else if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    else if (error.name === "JsonWebTokenError")
      error = handleJsonWebTokenError();
    else if (error.name === "TokenExpiredError")
      error = handleTokenExpiredError();

    sendErrorProd(error, req, res);
  }
  next(err);
};
