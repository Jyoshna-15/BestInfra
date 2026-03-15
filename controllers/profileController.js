const User = require("../models/User");


// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      name: user.name,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};