const express = require('express');
const _ = require('lodash');

const { TimeSheet, validate } = require('../model/TimeSheet');
const { Project } = require('../model/Project');
const { Task } = require('../model/Task');
const auth = require('../middleware/auth');
const { logRecentActivity } = require('../utils');

const router = express.Router();

const fields = [
  'project',
  'startDate',
  'endDate',
  'comments',
  'status',
  'approverComments'
];

router.post('/', [auth], async (req, res) => {
  const obj = _.pick(req.body, [
    'project',
    'startDate',
    'endDate',
    'comments',
    'timeSpent',
    'pointsDone'
  ]);
  obj.peopleId = req.user.emailId;
  obj.people = {
    id: req.user.emailId,
    name: req.user.name
  };
  const timesheet = new TimeSheet(obj);
  const data = await timesheet.save();

  await logRecentActivity(
    'Generated TimeSheet',
    req,
    _.pick(data, fields),
    data.project.id
  );
  res.send({ msg: 'Timesheet submitted' });
});

router.post('/:timesheetId', [auth], async (req, res) => {
  const timesheet = await TimeSheet.findById(req.params.timesheetId);
  if (timesheet.status === 'approved') {
    return res.status(400).send({ msg: 'Cannot edit the approved timesheet' });
  }
  const obj = _.pick(req.body, ['comments', 'timeSpent', 'pointsDone']);
  Object.assign(timesheet, obj);
  const data = await timesheet.save();
  await logRecentActivity(
    'Edited TimeSheet',
    req,
    _.pick(data, fields),
    data.project.id
  );
  res.send({ msg: 'Timesheet Edited' });
});

router.delete('/:timesheetId', [auth], async (req, res) => {
  const timesheet = await TimeSheet.findById(req.params.timesheetId);
  if (timesheet.status === 'approved') {
    return res
      .status(400)
      .send({ msg: 'Cannot delete the approved timesheet' });
  }
  const data = await timesheet.remove();
  await logRecentActivity(
    'Deleted TimeSheet',
    req,
    _.pick(data, fields),
    data.project.id
  );
  res.send({ msg: 'Timesheet Deleted' });
});

router.get('/me', [auth], async (req, res) => {
  const data = await TimeSheet.find({ 'people.id': req.user.emailId });
  res.send(data);
});

router.get('/review', [auth], async (req, res) => {
  let idList = await Project.find({ owner: req.user.emailId }, '_id');
  idList = idList.map(item => String(item._id));
  const data = await TimeSheet.find({
    status: 'pending',
    'project.id': { $in: idList }
  });
  res.send(data);
});

router.post('/review/:timesheetId', [auth], async (req, res) => {
  const obj = _.pick(req.body, [
    'approverComments',
    'status',
    'timeSpent',
    'pointsDone'
  ]);
  const data = await TimeSheet.findById(req.params.timesheetId);
  if (!data || data.status !== 'pending') {
    return res.status(400).send({ msg: 'Timesheet unavailable' });
  }
  Object.assign(data, obj);
  const data2 = await data.save();

  await logRecentActivity(
    `${data.status === 'approved' ? 'Approved' : 'Rejected'} TimeSheet`,
    req,
    _.pick(data, fields),
    data.project.id
  );
  res.send(data2);
});

module.exports = router;
