const { RecentActivity } = require('../model/RecentActivity');

module.exports.logRecentActivity = async function logRecentActivity(
  type,
  req,
  data,
  projectId,
  taskId
) {
  const recentActivity = new RecentActivity({
    type,
    user: {
      emailId: req.user.emailId,
      name: req.user.name
    },
    data,
    projectId,
    taskId
  });
  return recentActivity.save();
};
