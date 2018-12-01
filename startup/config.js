const config = require('config');

module.exports = function appConfig() {
  if (!config.get('jwtPrivateKey')) {
    throw new Error('FATALLLL ERROR: jwtPrivateKey is not defined.');
  }
};
