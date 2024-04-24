const mongoose = require('mongoose');
const slugify = require('slugify');
const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item MUST have a title!!!'],
    trim: true,
    maxLength: [40, 'item name must be less than 40 characters'],
    minLength: [3, 'an item name must be more than 2 characters']
  },
  slug: String,
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
  secretItem: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

itemSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

// Document middleware: runs before .save() and .create()
// CREATE A SLUG BASED ON ITEM NAME
itemSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// itemSchema.post('save', function(doc, next) {
//   console.log('post doc is ', doc);
//   next();
// });

// Query middleware for any mongoose function starting with find - eg findOne etc
itemSchema.pre(/^find/, function(next) {
  this.find({ secretItem: { $ne: true } });
  next();
});

// custom validators can go here

module.exports = mongoose.model('Item', itemSchema);
