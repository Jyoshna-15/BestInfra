const User = require("../models/User");

const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const range = req.query.range;

    let usageGraph = user.usageGraph.sevenDays;

    if (range === "30d") {
      usageGraph = user.usageGraph.thirtyDays;
    }

    if (range === "90d") {
      usageGraph = user.usageGraph.ninetyDays;
    }

    if (range === "1y") {
      usageGraph = user.usageGraph.oneYear;
    }

    // ✅ Calculate days left
    const today = new Date();
    const due = new Date(user.dueDate);

    const diffTime = due - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // ✅ Calculate usage percentage
    const usagePercentage = (
      ((user.monthlyUsage - user.lastMonthUsage) / user.lastMonthUsage) * 100
    ).toFixed(1);

    // ✅ Calculate saved units
    const savedUnits = user.lastMonthUsage - user.monthlyUsage;

    res.status(200).json({
      balance: user.balance,
      dueAmount: user.dueAmount,
      dueDate: user.dueDate,
      daysLeft,

      meterNumber: user.meterNumber,
      consumerName: user.consumerName,
      signalStrength: user.signalStrength,
      lastCommunication: user.lastCommunication,

      monthlyUsage: user.monthlyUsage,
      lastMonthUsage: user.lastMonthUsage,
      usagePercentage,
      savedUnits,

      avgDailyUsage: user.avgDailyUsage,
      peakUsage: user.peakUsage,

      usageGraph,

      alerts: [
        {
          serialNumber: 1,
          meterSerialNumber: user.meterNumber,
          consumerName: user.consumerName
        },
        {
          serialNumber: 2,
          meterSerialNumber: user.meterNumber,
          consumerName: user.consumerName
        },
        {
          serialNumber: 3,
          meterSerialNumber: user.meterNumber,
          consumerName: user.consumerName
        }
      ]
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getDashboard
};