const express = require('express');
const _ = require('lodash');

const auth = require('../middleware/auth');
const { RecentActivity } = require('../model/RecentActivity');

const router = express.Router();

router.get('/:projectId', [auth], async (req, res) => {
  const data = await RecentActivity.find(
    { projectId: req.params.projectId },
    '_id type user.name data.name'
  );
  res.send(data);
});

router.get('/task/:taskId', [auth], async (req, res) => {
  const data = await RecentActivity.find(
    { taskId: req.params.taskId },
    '_id type user.name data.name'
  );
  res.send(data);
});

router.get('/details/:logId', [auth], async (req, res) => {
  const data = await RecentActivity.findById(req.params.logId);
  res.send(data);
});

module.exports = router;
