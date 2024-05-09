const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
const validator = require("validator");
// const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: [true, "this username is already in use"],
    required: [true, "please provide a username"],
    lowercase: true
  },
  email: {
    type: String,
    required: [true, "please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide a valid email"]
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minlength: 6,
    select: false
  },

  isAdmin: {
    type: Boolean,
    default: false
  },

  // TODO: work out how password confirm can work when a user has created an item - as this triggers the save() function and therefore requires password confirm?
  // passwordConfirm: {
  //   type: String,
  //   required: [true, "please confirm your password"],

  //   validate: {
  //     /// This only works on SAVE (not findOneAndUpdate etc)
  //     validator: function(pswd) {
  //       return pswd === this.password;
  //     },
  //     message: "Passwords don"t match"
  //   }
  // },
  // passwordChangedAt: Date
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item"
    }
  ]
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

userSchema.pre("save", async function(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  user.password = await bcrypt.hash(user.password, 12);
  user.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

// TODO: complete this when add in password change function
userSchema.methods.changedPassword = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    console.log(this.passwordChangedAt, JWTTimestamp);
  }
  return false;
};

const User = mongoose.model("User", userSchema);
// userSchema.plugin(uniqueValidator);
module.exports = User;
