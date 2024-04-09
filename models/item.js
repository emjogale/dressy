const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item MUST have a title!!!'],
    trim: true
  },
  img: {
    type: String,
    required: true
  },

  // if there are multiple images
  // images: [String]

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
    required: [true, 'Please describe the item'],
    trim: true
  },
  size: {
    type: String,
    required: [true, 'Please specify a size']
  },
  onSale: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Item', itemSchema);
