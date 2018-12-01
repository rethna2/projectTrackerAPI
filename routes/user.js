const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('config');
const { User, validateRegister, validateLogin } = require('../model/User');
const auth = require('../middleware/auth');
const getUser = require('../middleware/getUser');

const router = express.Router();

router.get('/', [getUser], (req, res) => {
  res.send(req.user);
});

router.post('/register', async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findById(req.body.email);
  if (user) return res.status(400).send('User already registered.');
  const userObj = _.pick(req.body, ['name', 'password']);
  userObj._id = req.body.emailId;
  const salt = await bcrypt.genSalt(10);
  userObj.password = await bcrypt.hash(userObj.password, salt);
  const totalRecords = await User.find({});
  user = new User(userObj);
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth', token).send(_.pick(user, ['emailId', 'name']));
});

router.post('/login', async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.emailId);
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  res.header('x-auth', token).send(_.pick(user, ['emailId', 'name']));
});

router.post('/forgotPassword', async (req, res) => {
  const buffer = await crypto.randomBytes(20);
  const token = buffer.toString('hex');
  const user = await User.findById(req.body.emailId);
  if (!user) {
    // dont reveal that, this is not a valid user
    return res.send({ msg: 'Password reset link sent through email' });
  }
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  const data = await user.save();

  const link = `${req.protocol}://${req.get('Host')}/resetpassword/${
    user.emailId
  }/${token}`;
  await sendForgetPasswordEmail(user.name, user.emailId, link);
  res.send({
    msg: 'Password reset link sent through email'
  });
});

function sendForgetPasswordEmail(name, emailId, link) {
  const text = `Hi ${name},
It seems like you have forgotten your password for Project Tracker. Please follow the below link to reset.

${link}

Please ignore this email, if you have not requested for password change. And your password will remain the same.

Thanks,
ProjectTracker Team
`;

  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: config.get('communicationEmail'),
      pass: config.get('emailPass')
    }
  });
  const mailOptions = {
    to: emailId,
    from: 'Project Tracker <admin@projecttracker.com>',
    subject: 'Project Tracker - Password Reset',
    text
  };
  return smtpTransport.sendMail(mailOptions);
}

router.post('/resetPassword/:emailId/:token', async (req, res) => {
  const user = await User.findById(req.params.emailId);
  if (user.resetPasswordToken === req.params.token) {
    if (user.resetPasswordExpires > Date.now()) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      const token = user.generateAuthToken();
      res.header('x-auth', token).send(_.pick(user, ['emailId', 'name']));
    } else {
      return res.status(400).send({ msg: 'Password reset token expired!' });
    }
  } else {
    return res.status(400).send({ msg: 'Invalid Token' });
  }
});

module.exports = router;
