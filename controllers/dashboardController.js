const User = require("../models/User");

const getDashboard = async (req, res) => {
  try {
    const user  = await User.findById(req.user._id);
    const range = req.query.range;
    const date  = req.query.date; // "2026-03-15" from frontend

    let usageGraph = user.usageGraph.sevenDays;

    if (range === "30d") usageGraph = user.usageGraph.thirtyDays;
    if (range === "90d") usageGraph = user.usageGraph.ninetyDays;
    if (range === "1y")  usageGraph = user.usageGraph.oneYear;

    // ── If date picked, filter thirtyDays by that month ──
    if (date) {
      const picked       = new Date(date);
      const pickedMonth  = picked.getMonth();
      const pickedYear   = picked.getFullYear();

      usageGraph = user.usageGraph.thirtyDays.filter((item) => {
        const d = new Date(item.label);
        return d.getMonth() === pickedMonth && d.getFullYear() === pickedYear;
      });
    }

    // ── Format labels nicely for chart display ──
    usageGraph = usageGraph.map((item) => {
      const d = new Date(item.label);
      const isMonthRange = !date && (range === "90d" || range === "1y");
      return {
        ...item,
        label: isMonthRange
          ? d.toLocaleString("default", { month: "short" }) // "Mar"
          : String(d.getDate())                              // "15"
      };
    });

    // ── Days left ──
    const today    = new Date();
    const due      = new Date(user.dueDate);
    const diffTime = due - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // ── Usage stats ──
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