const express = require('express');
const config = require('config');
const stripe = require('stripe')(config.get('stripeKey'));
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/charge', [auth], async (req, res) => {
  // return res.send({ status: 'Dummy Status' });
  const { source, price } = req.body;
  if (price && price > 20) {
    return res.status.send({ msg: 'Amount too high' });
  }
  const response = await stripe.charges.create({
    amount: price ? price * 100 : 100,
    currency: 'usd',
    description: 'Project Tracker membership',
    source
  });
  res.json(response);
});

module.exports = router;
