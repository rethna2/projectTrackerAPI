const Joi = require('joi');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    owner: String,
    name: String,
    description: String,
    team: [String],
    totalPoints: {
      type: Number,
      default: 0
    },
    pointsDone: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

function validate(obj) {
  const schema = {
    owner: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    name: Joi.string()
      .min(6)
      .max(30)
      .required(),
    description: Joi.string(),
    team: Joi.array()
      .items(Joi.string())
      .required(),
    totalPoints: Joi.number(),
    pointsDone: Joi.number(),
    timeSpent: Joi.number()
  };
  return Joi.validate(obj, schema);
}

module.exports = {
  Project: mongoose.model('Project', projectSchema),
  validate
};
