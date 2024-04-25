// custom async errors function
module.exports = fn => {
  return (req, res, next) => {
    console.log('we are in the step 1 of errors');
    fn(req, res, next).catch(err => next(err));
  };
};
