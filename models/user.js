const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const Schema = mongoose.Schema;
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');

const iserSchema = new Schema({
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
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password']
  }
});

const User = mongoose.model('User', userSchema);
UserSchema.plugin(uniqueValidator);
module.exports = User;
