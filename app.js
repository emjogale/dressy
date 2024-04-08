const mongoose = require('mongoose');
const config = require('./utils/config');
// everything to do with the express application
const express = require('express');

const app = express();
const morgan = require('morgan');

const itemRouter = require('./routes/itemRoutes');
const userRouter = require('./routes/userRoutes');

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch(err => {
    err('error connectiong to MongoDB', err.message);
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

module.exports = app;
