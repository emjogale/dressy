const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const Schema = mongoose.Schema;
const validator = require('validator');
// const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    unique: [true, 'this username is already in use'],
    required: [true, 'please provide a username'],
    lowercase: true
  },
  email: {
    type: String,
    required: [true, 'please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 6
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    /// This only works on SAVE (not findOneAndUpdate etc)
    validate: {
      validator: function(pswd) {
        return pswd === this.password;
      },
      message: "Passwords don't match"
    }
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    }
  ]
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);
// userSchema.plugin(uniqueValidator);
module.exports = User;
