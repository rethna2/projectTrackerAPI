const express = require('express');
const user = require('../routes/user');
const project = require('../routes/project');
const task = require('../routes/task');
const time = require('../routes/time');
const timesheet = require('../routes/timesheet');
const recentactivity = require('../routes/recentactivity');
const error = require('../middleware/error');

module.exports = function routeSetup(app) {
  app.use(express.json());
  app.use('/api/user', user);
  app.use('/api/project', project);
  app.use('/api/task', task);
  app.use('/api/time', time);
  app.use('/api/timesheet', timesheet);
  app.use('/api/recentactivity', recentactivity);
  app.use(error);
};
