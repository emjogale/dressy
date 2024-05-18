const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const config = require("./utils/config");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// route to static files
app.use(express.static(path.join(`${__dirname}/public`)));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const itemRouter = require("./routes/itemRoutes");
const userRouter = require("./routes/userRoutes");
const viewRouter = require("./routes/viewRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

mongoose.set("strictQuery", false);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch(err => {
    console.log("error connectiong to MongoDB", err.message);
  });

// middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cors());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// the routers are middleware added to these specific routes
app.use("/", viewRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/users", userRouter);

// unknown endpoints
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
