// establish connection to database
const mongoose = require('mongoose');
const morgan = require('morgan');
const express = require('express');
const config = require('./utils/config');

const app = express();

const itemRouter = require('./routes/itemRoutes');
const userRouter = require('./routes/userRoutes');
const { errorHandler } = require('./utils/middleware');
const AppError = require('./utils/appError');

mongoose.set('strictQuery', false);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(err => {
    console.log('error connectiong to MongoDB', err.message);
  });

// middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// route to static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// the routers are also middleware to be added to these specific routes
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/users', userRouter);

// unknown endpoints
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);
module.exports = app;
