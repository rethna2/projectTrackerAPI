const Joi = require('joi');

module.exports = function validationSetup() {
  Joi.objectId = require('joi-objectid')(Joi);
};
