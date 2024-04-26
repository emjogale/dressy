const Item = require("../models/item");
const User = require("../models/user");

const initialItems = [
  {
    title: "long coat",
    img: "long-coat.webp",
    category: "coats",
    price: 355,
    desc: "long white coat",
    size: "10"
  },
  {
    title: "applique dress",
    img: "applique-dress.webp",
    category: "dresses",
    price: 455,
    desc: "long white organza dress wit applique",
    size: "12"
  }
];

const itemsInDb = async () => {
  const items = await Item.find({});
  return items.map(item => item.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

module.exports = { initialItems, itemsInDb, usersInDb };
