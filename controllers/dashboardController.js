const User = require("../models/User");

const getDashboard = async (req, res) => {
  try {
    const user  = await User.findById(req.user._id);
     const user = userDoc.toObject();
    const range = req.query.range || "7d";
    const date  = req.query.date; // "2026-03-15"

    let usageGraph = [];

    if (date) {
      // ── Date picked — show data BEFORE that date ──
      const picked = new Date(date);
      picked.setHours(23, 59, 59);

      if (range === "7d") {
        // last 7 days before picked date from thirtyDays pool
        usageGraph = user.usageGraph.thirtyDays
          .filter((item) => new Date(item.label) <= picked)
          .sort((a, b) => new Date(a.label) - new Date(b.label))
          .slice(-7);
      } else if (range === "30d") {
        // last 30 days before picked date
        usageGraph = user.usageGraph.thirtyDays
          .filter((item) => new Date(item.label) <= picked)
          .sort((a, b) => new Date(a.label) - new Date(b.label))
          .slice(-30);
      } else if (range === "90d") {
        // last 3 months before picked date
        usageGraph = user.usageGraph.ninetyDays
          .filter((item) => new Date(item.label) <= picked)
          .sort((a, b) => new Date(a.label) - new Date(b.label))
          .slice(-3);
      } else if (range === "1y") {
        // last 12 months before picked date
        usageGraph = user.usageGraph.oneYear
          .filter((item) => new Date(item.label) <= picked)
          .sort((a, b) => new Date(a.label) - new Date(b.label))
          .slice(-12);
      }
    } else {
      // ── No date — use stored data directly ──
      if (range === "7d")  usageGraph = user.usageGraph.sevenDays;
      if (range === "30d") usageGraph = user.usageGraph.thirtyDays;
      if (range === "90d") usageGraph = user.usageGraph.ninetyDays;
      if (range === "1y")  usageGraph = user.usageGraph.oneYear;
    }

    // ── Format labels for chart ──
  // ── Format labels for chart ──
usageGraph = usageGraph.map((item) => {
  const plainItem = item.toObject ? item.toObject() : item; // ← convert Mongoose doc to plain object
  const d = new Date(plainItem.label);
  const isMonthView = range === "90d" || range === "1y";
  return {
    label: isMonthView
      ? d.toLocaleString("default", { month: "short" })
      : String(d.getDate()),
    value: plainItem.value
  };
});

    // ── Days left ──
    const today    = new Date();
    const due      = new Date(user.dueDate);
    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    const usagePercentage = (
      ((user.monthlyUsage - user.lastMonthUsage) / user.lastMonthUsage) * 100
    ).toFixed(1);
    const savedUnits = user.lastMonthUsage - user.monthlyUsage;

    res.status(200).json({
      balance:           user.balance,
      dueAmount:         user.dueAmount,
      dueDate:           user.dueDate,
      daysLeft,
      meterNumber:       user.meterNumber,
      consumerName:      user.consumerName,
      signalStrength:    user.signalStrength,
      lastCommunication: user.lastCommunication,
      monthlyUsage:      user.monthlyUsage,
      lastMonthUsage:    user.lastMonthUsage,
      usagePercentage,
      savedUnits,
      avgDailyUsage:     user.avgDailyUsage,
      peakUsage:         user.peakUsage,
      usageGraph,
      alerts: [
        { serialNumber: 1, meterSerialNumber: user.meterNumber, consumerName: user.consumerName },
        { serialNumber: 2, meterSerialNumber: user.meterNumber, consumerName: user.consumerName },
        { serialNumber: 3, meterSerialNumber: user.meterNumber, consumerName: user.consumerName }
      ]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard };