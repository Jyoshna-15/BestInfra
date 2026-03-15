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

    res.status(200).json({
      balance: user.balance,
      dueAmount: user.dueAmount,
      dueDate: user.dueDate,
      meterNumber: user.meterNumber,
      lastCommunication: user.lastCommunication,
      monthlyUsage: user.monthlyUsage,
      avgDailyUsage: user.avgDailyUsage,
      peakUsage: user.peakUsage,
      usageGraph,

      alerts: [
        {
          serialNumber: 1,
          meterSerialNumber: user.meterNumber,
          consumerName: user.name
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