const express = require('express');
const _ = require('lodash');

const { Project, validate } = require('../model/Project');
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
