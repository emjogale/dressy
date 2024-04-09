const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
  //   if (error.name === 'CastError') {
  //     return response.status(400).send({
  //       error: 'malformatted id'
  //     });
  //   } else if (error.name === 'ValidationError') {
  //     return response.status(400).json({ error: error.message });
  //   }
  next(err);
};

module.exports = {
  errorHandler
};
