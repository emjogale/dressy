const AppError = require('./appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateError = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value} please use a unique username`;
  return new AppError(message, 400);
};

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(x => x.message);
  // maybe save the errors as an array so they can be put into a list or something
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
const sendErrorProd = (err, res) => {
  // ooperational error that we trust: send message to client
  if (err.isOperational) {
    console.log('it is one of these ones');
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // programming or other unknown error: don't leak details to client
    // log error
    console.log('it is one of these ones');
    console.error('ERROR 😨', err);
    // send generic message
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong'
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    console.log('we have a prod mode error which is', error);
    if (error.name === 'CastError') {
      console.log('yeah we have a cast error');
      err = handleCastErrorDB(error);
      sendErrorProd(error, res);
    }
    if (error.code === 11000) {
      console.log('yeah we have a duplicate error');
      err = handleDuplicateError(error);
      sendErrorProd(error, res);
    }
    if (error.name === 'ValidationError') {
      console.log('yeah we have a validation error');
      error = handleValidationError(error);

      sendErrorProd(error, res);
    }
  }
  next(err);
};

module.exports = {
  errorHandler
};

// old error handler code
//   if (error.name === 'CastError') {
//     return response.status(400).send({
//       error: 'malformatted id'
//     });
//   } else if (error.name === 'ValidationError') {
//     return response.status(400).json({ error: error.message });
//   }
