const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id
    });

    res.status(200).json(notifications);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getNotifications
};