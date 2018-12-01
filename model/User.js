const mongoose = require('mongoose');
const config = require('config');

const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 55
  },
  _id: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
    alias: 'emailId'
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateAuthToken = function generateAuthToken() {
  const token = jwt.sign(
    {
      name: this.name,
      emailId: this.emailId,
      isAdmin: this.isAdmin
    },
    config.get('jwtprivatekey')
  );
  return token;
};

const loginSchema = {
  emailId: Joi.string()
    .min(5)
    .max(255)
    .required()
    .email(),
  password: Joi.string()
    .min(5)
    .max(255)
    .required()
};

function validateLogin(user) {
  return Joi.validate(user, loginSchema);
}

function validateRegister(user) {
  const registerSchema = {
    name: Joi.string()
      .min(2)
      .max(50)
      .required(),
    ...loginSchema
  };

  return Joi.validate(user, registerSchema);
}

module.exports = {
  User: mongoose.model('User', userSchema),
  validateRegister,
  validateLogin
};
