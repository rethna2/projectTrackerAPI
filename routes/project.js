const express = require('express');
const _ = require('lodash');

const { Project, validate } = require('../model/Project');
const { Task } = require('../model/Task');
const { Time } = require('../model/Time');

const auth = require('../middleware/auth');
const { logRecentActivity } = require('../utils');

const router = express.Router();

router.post('/', [auth], async (req, res) => {
  const obj = {
    ..._.pick(req.body, ['name', 'description', 'team']),
    owner: req.user.emailId
  };

  const { error } = validate(obj);
  if (error) return res.status(400).send(error.details[0].message);

  const project = new Project(obj);
  const data = await project.save();
  res.send(data);
});

router.get('/', [auth], async (req, res) => {
  const allProjects = await Project.find({
    $or: [{ owner: req.user.emailId }, { team: req.user.emailId }],
    isDeleted: { $ne: true }
  });
  res.send(allProjects);
});

router.get('/export/:projectId', [auth], async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  const tasks = await Task.find({
    projectId: req.params.projectId,
    isDeleted: { $ne: true }
  });
  const times = await Time.find({
    projectId: req.params.projectId,
    isDeleted: { $ne: true }
  });
  const data = {
    project,
    tasks,
    times
  };
  const json = JSON.stringify(data);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-disposition', 'attachment; filename=project.json');
  console.log('working...');
  res.write(json, err => {
    res.end();
  });
});

router.post('/import', [auth], async (req, res) => {
  // TODO: use transaction based update using fawn or mongodb 4 transaction
  const data = req.body;
  const obj = {
    ..._.pick(data.project, [
      'name',
      'description',
      'team',
      'totalPoints',
      'pointsDone',
      'timeSpent'
    ]),
    owner: req.user.emailId
  };

  const { error } = validate(obj);
  if (error) return res.status(400).send(error.details[0].message);

  let project = new Project(obj);
  project = await project.save();
  const projectId = project._id;
  const taskFields = [
    'name',
    'description',
    'points',
    'status',
    'assignedTo',
    'pointsDone',
    'timeSpent'
  ];
  const tasks = data.tasks.map(item => ({
    ..._.pick(item, taskFields),
    projectId
  }));
  const oldTaskIds = data.tasks.map(item => item._id);
  const tasksRes = await Task.insertMany(tasks);

  const taskIdMap = {};
  tasksRes.forEach((item, index) => {
    taskIdMap[oldTaskIds[index]] = item._id;
  });
  const timeFields = [
    'timeSpent',
    'pointsDone',
    'comments',
    'date',
    'peopleId',
    'createdAt',
    'updatedAt'
  ];

  const times = data.times.map(item => ({
    ..._.pick(item, timeFields),
    task: {
      id: taskIdMap[item.task.id],
      name: item.task.name
    },
    projectId
  }));
  const timesRes = await Time.insertMany(times);
  res.send({
    timesRes
  });
});

router.post('/:projectId', [auth], async (req, res) => {
  const obj = {
    ..._.pick(req.body, ['name', 'description', 'team']),
    owner: req.user.emailId
  };
  const { error } = validate(obj);
  if (error) return res.status(400).send(error.details[0].message);

  const data = await Project.findByIdAndUpdate(req.params.projectId, obj);
  await logRecentActivity(
    'Edited Project',
    req,
    _.pick(data, ['name', 'description', 'team']),
    req.params.projectId
  );
  res.send(data);
});

router.delete('/:projectId', [auth], async (req, res) => {
  const data = await Project.findByIdAndUpdate(req.params.projectId, {
    $set: { isDeleted: true }
  });
  res.send({ msg: 'Deleted Project' });
});

module.exports = router;
