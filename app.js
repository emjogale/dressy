// everything to do with the express application
const express = require('express');
const app = express();
const morgan = require('morgan');

const itemRouter = require('./routes/itemRoutes');
const userRouter = require('./routes/userRoutes');

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
