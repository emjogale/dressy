// this is a script file which can be used to write data from the items.json file to the database if required
const mongoose = require("mongoose");
const fs = require("fs");
const config = require("../../utils/config");

const Item = require("../../models/item");

mongoose.set("strictQuery", false);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch(err => {
    console.log("error connectiong to MongoDB", err.message);
  });

// READ JSON File (and convert into a javascript object)
const items = JSON.parse(fs.readFileSync(`${__dirname}/items.json`, "utf-8"));

// Import data into database
const importData = async () => {
  try {
    await Item.create(items);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE all data that is currently in the Database
const deleteData = async () => {
  try {
    await Item.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
console.log(process.argv);
