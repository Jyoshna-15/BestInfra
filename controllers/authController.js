const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Notification = require("../models/Notification");
const generateToken = require("../services/generateToken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const today = new Date();

    const sevenDays  = [];
    const thirtyDays = [];
    const ninetyDays = [];
    const oneYear    = [];

    // ── 7 Days — last 7 days daily (newest last) ──
    for (let i = 7; i >= 1; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      sevenDays.push({
        label: date.toISOString().split("T")[0],   // "2026-03-11"
        value: Math.floor(Math.random() * 10) + 5  // 5–15 kWh
      });
    }

    // ── 30 Days — last 30 days daily (newest last) ──
    for (let i = 30; i >= 1; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      thirtyDays.push({
        label: date.toISOString().split("T")[0],   // "2026-02-16"
        value: Math.floor(Math.random() * 10) + 5  // 5–15 kWh
      });
    }

    // ── 90 Days — last 3 months, one entry per month (oldest first) ──
    for (let i = 3; i >= 1; i--) {
      const date = new Date();
      date.setDate(1);                    // first day of month
      date.setMonth(today.getMonth() - i);
      ninetyDays.push({
        label: date.toISOString().split("T")[0],      // "2025-12-01"
        value: Math.floor(Math.random() * 200) + 180  // 180–380 kWh
      });
    }

    // ── 1 Year — last 12 months, one entry per month (oldest first) ──
    for (let i = 12; i >= 1; i--) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(today.getMonth() - i);
      oneYear.push({
        label: date.toISOString().split("T")[0],      // "2025-03-01"
        value: Math.floor(Math.random() * 200) + 180  // 180–380 kWh
      });
    }

    // ── Create user with all graph data ──
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      usageGraph: {
        sevenDays,
        thirtyDays,
        ninetyDays,
        oneYear
      }
    });

    // ── Create default notifications ──
    await Notification.insertMany([
      {
        userId:      user._id,
        title:       "Low Balance Alert",
        description: "Your meter balance is below ₹100.\nRecharge now to avoid disconnection.",
        type:        "alert",
        date:        "Today"
      },
      {
        userId:      user._id,
        title:       "Upcoming Due Date",
        description: "Your bill of ₹3,180 is due on 10 May.\nPay now to avoid late fees.",
        type:        "due",
        date:        "Today"
      },
      {
        userId:      user._id,
        title:       "Payment Successful",
        description: "₹3,180 received.\nThank you for staying current.",
        type:        "success",
        date:        "Yesterday"
      }
    ]);

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).json({
        token:        generateToken(user._id),
        consumerName: user.name,
        name:         user.name
      });
    } else {
      res.status(401).json({
        message: "Invalid credentials"
      });
    }

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};