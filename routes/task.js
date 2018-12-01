const express = require('express');
const _ = require('lodash');

const { Task, validate } = require('../model/Task');
const { Project } = require('../model/Project');
const auth = require('../middleware/auth');
const { logRecentActivity } = require('../utils');

const router = express.Router();

const fields = ['name', 'description', 'points', 'status', 'assignedTo'];

router.get('/:projectId', [auth], async (req, res) => {
  const data = await Task.find(
    { projectId: req.params.projectId },
    'name _id status assignedTo points pointsDone timeSpent'
  );
  res.send(data);
});

router.post('/:projectId', [auth], async (req, res) => {
  const obj = _.pick(req.body, fields);
  obj.projectId = req.params.projectId;

  const { error } = validate(obj);
  if (error) return res.status(400).send(error.details[0].message);

  const task = new Task(obj);
  const data = await task.save();
  if (data.points) {
    Project.findByIdAndUpdate(req.params.projectId, {
      $inc: { totalPoints: Number(data.points) }
    });
  }
  await logRecentActivity(
    'Created Task',
    req,
    _.pick(data, fields),
    req.params.projectId,
    data._id
  );
  res.send(data);
});

router.post('/:projectId/:taskId', [auth], async (req, res) => {
  const obj = _.pick(req.body, fields);
  obj.projectId = req.params.projectId;

  const { error } = validate(obj);
  if (error) return res.status(400).send(error.details[0].message);

  const data = await Task.findById(req.params.taskId);
  const prevPoints = data.points || 0;
  if (data.projectId.toString() !== req.params.projectId) {
    return res.status(400).send('Invalid Project Id');
  }
  Object.assign(data, obj);
  const data2 = await data.save();
  if (data.points) {
    Project.findByIdAndUpdate(req.params.projectId, {
      $inc: { totalPoints: Number(data2.points - prevPoints) }
    });
  }
  await logRecentActivity(
    'Edited Task',
    req,
    _.pick(data, fields),
    req.params.projectId,
    data._id
  );
  res.send(data2);
});

module.exports = router;
