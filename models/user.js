import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Pleae Enter your name'],
    maxLength: [30, 'Name should be maximum of 30 characters'],
    minLength: [4, 'Name should be atleast 4 characters long'],
  },
  email: {
    type: String,
    required: [true, 'Pleae Enter your Email'],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Pleae Enter your password'],
    minLength: [8, 'Name should be atleast 8 characters long'],
    select: false,
  },
  avatar: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  role: { type: String, required: true, default: 'user' },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// We dont use arrow function here, bcs we are using this keyword inside function
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    // if password is not modified then dont encrypt, otherwise it will encrypt the encrypted password, -> why to encryt again
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
});

// JWT Token

// Generate JWT token and store in cookie
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  // console.log(this.password);
  // console.log(enteredPassword);
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generating password reset token
userSchema.methods.getResetPasswordToken = async function () {
  //Generate Token
  const resetToken = crypto.randomBytes(20).toString('hex');
  // console.log(resetToken);

  // Hashing and adding to User Schema
  this.resetPasswordToken = crypto
    .createHash('SHA256')
    .update(resetToken)
    .digest('hex');
  // console.log(this.resetPasswordToken);
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  // console.log(this.resetPasswordExpire);

  return resetToken;
};

export default mongoose.model('User', userSchema);
