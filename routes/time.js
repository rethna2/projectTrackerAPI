const express = require('express');

const router = express.Router();
const _ = require('lodash');

const { Time, validate } = require('../model/Time');
const { Task } = require('../model/Task');
const { Project } = require('../model/Project');

const auth = require('../middleware/auth');
const { logRecentActivity } = require('../utils');

router.post('/:projectId/:taskId', [auth], async (req, res) => {
  const obj = _.pick(req.body, ['timeSpent', 'pointsDone', 'comments', 'date']);
  obj.taskId = req.params.taskId;
  obj.projectId = req.params.projectId;
  obj.peopleId = req.user.emailId;
  const { error } = validate(obj);
  if (error) return res.status(400).send(error.details[0].message);
  const task = await Task.findById(req.params.taskId);
  if (false) {
    // check if the task is assigned to particular person
    if (!task || task.assignedTo !== req.user.emailId) {
      return res.status(400).send('Sorry! This task is not assigned to you.');
    }
  }
  const time = new Time(obj);
  const data = await time.save();
  task.timeSpent += obj.timeSpent;
  task.pointsDone += obj.pointsDone;
  await task.save();

  await Project.findByIdAndUpdate(task.projectId, {
    $inc: { timeSpent: obj.timeSpent, pointsDone: obj.pointsDone }
  });
  await logRecentActivity(
    'Logged Time',
    req,
    {
      ..._.pick(data, ['_id', 'timeSpent', 'pointsDone', 'comments', 'date']),
      name: task.name
    },
    task.projectId,
    req.params.taskId
  );
  res.send(data);
});

router.post('/:projectId/:taskId/:timeId', [auth], async (req, res) => {
  const obj = _.pick(req.body, ['timeSpent', 'pointsDone', 'comments', 'date']);
  obj.taskId = req.params.taskId;
  obj.projectId = req.params.projectId;
  obj.peopleId = req.user.emailId;
  const { error } = validate(obj);
  if (error) return res.status(400).send(error.details[0].message);
  const task = await Task.findById(req.params.taskId);
  if (false) {
    // check if the task is assigned to particular person
    if (!task || task.assignedTo !== req.user.emailId) {
      return res.status(400).send('Sorry! This task is not assigned to you.');
    }
  }

  const data = await Time.findById(req.params.timeId);
  if (data.taskId.toString() !== req.params.taskId) {
    return res.status(400).send('Invalid task Id');
  }
  const timeSpentDelta = obj.timeSpent - data.timeSpent;
  const pointsDoneDelta = obj.pointsDone - data.pointsDone;
  Object.assign(data, obj);
  const data2 = await data.save();

  task.timeSpent += timeSpentDelta;
  task.pointsDone += pointsDoneDelta;
  await task.save();
  await Project.findByIdAndUpdate(task.projectId, {
    $inc: { timeSpent: timeSpentDelta, pointsDone: pointsDoneDelta }
  });
  await logRecentActivity(
    'Edited Time',
    req,
    {
      ..._.pick(data, ['_id', 'timeSpent', 'pointsDone', 'comments', 'date']),
      name: task.name
    },
    task.projectId,
    req.params.taskId
  );
  res.send(data2);
});

router.get('/task/:taskId', [auth], async (req, res) => {
  const data = await Time.find({ taskId: req.params.taskId });
  res.send(data);
});

router.get('/people/:peopleId', [auth], async (req, res) => {
  const data = await Time.find({ peopleId: req.params.peopleId });
  res.send(data);
});

router.get('/project/:projectId', [auth], async (req, res) => {
  const { from, to, user } = req.query;
  let time;
  if (from && to && user) {
    time = await Time.find({
      projectId: req.params.projectId,
      peopleId: user,
      date: { $gte: from, $lte: to }
    });
  } else {
    time = await Time.find({ projectId: req.params.projectId });
  }
  res.send(time);
});

module.exports = router;
