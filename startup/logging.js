const winston = require('winston');
// require('winston-mongodb');
require('express-async-errors');
const config = require('config');

module.exports = function logSetup() {
  winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: 'uncaughtExceptions.log' })
  );

  process.on('unhandledRejection', ex => {
    throw ex;
  });

  winston.add(winston.transports.File, { filename: 'logfile.log' });
  // const db = config.get('db');
  // winston.add(winston.transports.MongoDB, {
  //   db,
  //   level: 'info'
  // });
};
