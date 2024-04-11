const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');
const express = require('express');
const config = require('./utils/config');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// route to static files
app.use(express.static(path.join(`${__dirname}/public`)));

const itemRouter = require('./routes/itemRoutes');
const userRouter = require('./routes/userRoutes');
// const { errorHandler } = require('./utils/middleware');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

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

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const items = [
  {
    title: 'long coat',
    img: '#',
    category: 'coats',
    price: 355,
    desc: 'long white coat',
    size: '10'
  },
  {
    title: 'applique dress',
    img: '#',
    category: 'dresses',
    price: 455,
    desc: 'long white organza dress wit applique',
    size: '12'
  }
];

loggedIn = true;
// the routers are also middleware to be added to these specific routes
app.get('/', (req, res) => {
  res.status(200).render('index', { loggedIn: loggedIn, items: items });
});
app.get('/sell', (req, res) => {
  res.status(200).render('sell', { loggedIn: loggedIn, errors: null });
});
app.get('/about', (req, res) => {
  res.status(200).render('about');
});
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/users', userRouter);

// app.use(errorHandler);
// unknown endpoints
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
