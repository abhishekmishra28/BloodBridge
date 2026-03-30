const User = require('../models/User');
const Booking = require('../models/Booking');
const Request = require('../models/Request');
const Hospital = require('../models/Hospital');
const Slot = require('../models/Slot');
const Notification = require('../models/Notification');

// @route GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalBookings,
      completedDonations,
      pendingBookings,
      totalRequests,
      openRequests,
      criticalRequests,
      totalHospitals,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', lastDonationDate: { $ne: null } }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'pending' }),
      Request.countDocuments(),
      Request.countDocuments({ status: 'open' }),
      Request.countDocuments({ status: 'open', urgency: 'Critical' }),
      Hospital.countDocuments({ isActive: true }),
    ]);

    // Monthly donation trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyDonations = await Booking.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Blood group distribution
    const bloodGroupStats = await User.aggregate([
      { $match: { role: 'user', bloodGroup: { $ne: null } } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Request urgency distribution
    const urgencyStats = await Request.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalDonors,
          totalBookings,
          completedDonations,
          pendingBookings,
          totalRequests,
          openRequests,
          criticalRequests,
          totalHospitals,
        },
        monthlyDonations,
        bloodGroupStats,
        urgencyStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (status) query.status = status;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await Notification.create({
      user: user._id,
      title: 'Account Status Update',
      message: `Your account has been ${status} by the admin.`,
      type: 'system',
    });

    res.json({ success: true, message: `User ${status}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getAllUsers, updateUserStatus, deleteUser };
