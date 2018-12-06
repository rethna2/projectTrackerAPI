const Joi = require('joi');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const timeSchema = new Schema(
  {
    task: {
      id: {
        type: mongoose.Schema.ObjectId,
        required: true
      },
      name: { type: String, required: true }
    },
    projectId: {
      type: mongoose.Schema.ObjectId,
      required: true
    },
    timeSpent: {
      type: Number,
      required: true
    },
    pointsDone: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    peopleId: {
      type: String,
      required: true
    },
    comments: String
  },
  { timestamps: true }
);

function validate(obj) {
  const schema = {
    task: {
      id: Joi.objectId().required(),
      name: Joi.string()
    },
    projectId: Joi.objectId().required(),
    timeSpent: Joi.number()
      .max(10)
      .required(),
    pointsDone: Joi.number()
      .max(10)
      .required(),
    date: Joi.date().required(),
    peopleId: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    comments: Joi.string().max(255)
  };
  return Joi.validate(obj, schema);
}

module.exports = {
  Time: mongoose.model('Time', timeSchema),
  validate
};
