const Joi = require('joi');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const RecentActivitySchema = new Schema(
  {
    type: String,
    user: {
      emailId: String,
      name: String
    },
    data: {}, // It can be of any structure
    projectId: String,
    taskId: String
  },
  { timestamps: true }
);

module.exports = {
  RecentActivity: mongoose.model('RecentActivity', RecentActivitySchema)
};
