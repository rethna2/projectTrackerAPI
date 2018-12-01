const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  let token = req.header('x-auth');

  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtprivatekey'));
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
};
