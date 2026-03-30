const User = require('../models/User');

// @route GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, city, state, bloodGroup, age, gender } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, city, state, bloodGroup, age, gender },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/users/donors?city=&bloodGroup=
const searchDonors = async (req, res) => {
  try {
    const { city, bloodGroup } = req.query;
    const query = { role: 'user', status: 'active' };
    if (city) query.city = new RegExp(city, 'i');
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const donors = await User.find(query)
      .select('name bloodGroup city phone lastDonationDate')
      .limit(50);

    res.json({ success: true, donors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile, searchDonors };
