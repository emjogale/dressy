const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

//TODO: seem to be setting headers after they have been sent - there is some error in the error page!!
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    console.log('it doesnt start with api');
    console.log('err status is', err.statusCode);
    res.status(err.statusCode).render('notFound', { status: err.status });
  }
};

const sendErrorProd = (err, req, res) => {
  const msg = err.isOperational
    ? err.message
    : 'this is unexpected -- please contact support';
  !err.isOperational && console.error('error 🥵', err);

  if (req.originalUrl.match(/^[/]api[/]v/)) {
    res.status(err.statusCode).json({
      status: err.status,
      message: msg,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).render('notFound', {
      status: err.status,
      msg: msg
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, req, res);
  }
  next(err);
};
