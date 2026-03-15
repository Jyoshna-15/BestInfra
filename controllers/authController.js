const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Notification = require("../models/Notification");
const generateToken = require("../services/generateToken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const today = new Date();

    const sevenDays = [];
    const thirtyDays = [];
    const ninetyDays = [];
    const oneYear = [];

    // 7 Days → previous 7 dates excluding today
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      sevenDays.push({
        label: `${date.getDate()}`,
        value: Math.floor(Math.random() * 10) + 5
      });
    }

    // 30 Days → previous 30 dates
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      thirtyDays.push({
        label: `${date.getDate()}`,
        value: Math.floor(Math.random() * 10) + 5
      });
    }

    // 90 Days → previous 3 completed months
    for (let i = 3; i >= 1; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);

      ninetyDays.push({
        label: date.toLocaleString("default", { month: "short" }),
        value: Math.floor(Math.random() * 100) + 180
      });
    }

    // 1 Year → previous 12 months
    for (let i = 12; i >= 1; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);

      oneYear.push({
        label: date.toLocaleString("default", { month: "short" }),
        value: Math.floor(Math.random() * 100) + 180
      });
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      usageGraph: {
        sevenDays,
        thirtyDays,
        ninetyDays,
        oneYear
      }
    });

    await Notification.create({
      userId: user._id,
      title: "Bill Due Reminder",
      description: "Your electricity bill is due soon.",
      type: "bill_due",
      date: today.toISOString().split("T")[0]
    });

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

    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).json({
        token: generateToken(user._id),
        consumerName: user.name
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