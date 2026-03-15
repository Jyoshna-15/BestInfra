const mongoose = require("mongoose");

const graphItemSchema = new mongoose.Schema({
  label: String,
  value: Number
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  meterNumber: {
    type: String,
    default: "MTR123456"
  },

  balance: {
    type: Number,
    default: 500
  },

  dueAmount: {
    type: Number,
    default: 150
  },

  dueDate: {
    type: String,
    default: "2026-03-25"
  },

  lastCommunication: {
    type: String,
    default: "2026-03-14"
  },

  monthlyUsage: {
    type: Number,
    default: 320
  },

  avgDailyUsage: {
    type: Number,
    default: 10
  },

  peakUsage: {
    type: Number,
    default: 18
  },

  usageGraph: {
    sevenDays: [graphItemSchema],
    thirtyDays: [graphItemSchema],
    ninetyDays: [graphItemSchema],
    oneYear: [graphItemSchema]
  }
});

module.exports = mongoose.model("User", userSchema);