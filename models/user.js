const crypto = require("crypto");
const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
const validator = require("validator");
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
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minlength: 6,
    select: false
  },

  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password"],

    validate: {
      /// This only works on SAVE (not findOneAndUpdate etc)
      validator: function(pswd) {
        return pswd === this.password;
      },
      message: 'Passwords don"t match'
    }
  },

  passwordResetToken: String,
  passwordResetExpires: String,
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

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
// userSchema.plugin(uniqueValidator);
module.exports = User;
