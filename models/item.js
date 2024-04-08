const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    img: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: [true, 'Please specify a category']
    },
    price: {
      type: Number,
      required: [true, 'Please specify a price']
    },
    desc: {
      type: String,
      required: [true, 'Please describe the item']
    },
    size: {
      type: String,
      required: [true, 'Please specify a size']
    },
    onSale: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', ItemSchema);
