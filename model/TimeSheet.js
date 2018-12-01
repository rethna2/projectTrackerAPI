const Joi = require('joi');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const timeSheetSchema = new Schema(
  {
    people: {
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
    project: {
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      // pending, approved, rejected
      type: String,
      default: 'pending'
    },
    comments: String,
    approverComments: String
  },
  { timestamps: true }
);

function validate(obj) {
  const schema = {
    people: Joi.object({
      id: Joi.string()
        .min(5)
        .max(255)
        .required()
        .email(),
      name: Joi.string().required()
    }),
    project: Joi.object({
      id: Joi.objectId().required(),
      name: Joi.string().required()
    }),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    status: Joi.string(),
    comments: Joi.string().max(255),
    approverComments: Joi.string().max(255)
  };
  return Joi.validate(obj, schema);
}

module.exports = {
  TimeSheet: mongoose.model('TimeSheet', timeSheetSchema),
  validate
};
