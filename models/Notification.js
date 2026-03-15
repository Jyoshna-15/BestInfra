const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  title: String,

  description: String,

  type: String,

  date: {
    type: String
  }
});

module.exports = mongoose.model("Notification", notificationSchema);