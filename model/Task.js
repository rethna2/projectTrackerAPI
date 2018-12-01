const Joi = require('joi');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const taskSchema = new Schema({
  projectId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  name: String,
  description: String,
  points: Number,
  pointsDone: Number,
  timeSpent: Number,
  status: String,
  assignedTo: String
});

function validate(obj) {
  const schema = {
    projectId: Joi.objectId().required(),
    name: Joi.string()
      .min(6)
      .max(255)
      .required(),
    description: Joi.string()
      .min(6)
      .max(3000),
    points: Joi.number(),
    pointsDone: Joi.number(),
    timeSpent: Joi.number(),
    status: Joi.string().valid(['backlog', 'new', 'wip', 'review', 'done']),
    assignedTo: Joi.string()
  };
  return Joi.validate(obj, schema);
}

module.exports = {
  Task: mongoose.model('Task', taskSchema),
  validate
};
