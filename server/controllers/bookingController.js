const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route POST /api/bookings  [user]
const createBooking = async (req, res) => {
  try {
    const { slotId, bloodGroup, notes } = req.body;
    const userId = req.user._id;

    // Enforce 3-month donation restriction
    const user = await User.findById(userId);
    if (!user.canDonate) {
      const nextDate = new Date(user.lastDonationDate);
      nextDate.setMonth(nextDate.getMonth() + 3);
      return res.status(400).json({
        success: false,
        message: `You can donate again after ${nextDate.toDateString()} (3-month restriction)`,
      });
    }

    const slot = await Slot.findById(slotId).populate('hospital');
    if (!slot || !slot.isActive) {
      return res.status(404).json({ success: false, message: 'Slot not found or inactive' });
    }
    if (slot.availableSpots <= 0) {
      return res.status(400).json({ success: false, message: 'Slot is fully booked' });
    }

    // Check duplicate booking
    const existingBooking = await Booking.findOne({ user: userId, slot: slotId, status: { $in: ['pending', 'approved'] } });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You already have a booking for this slot' });
    }

    const booking = await Booking.create({
      user: userId,
      slot: slotId,
      hospital: slot.hospital._id,
      bloodGroup: bloodGroup || user.bloodGroup,
      notes,
    });

    // Increment slot booked count
    await Slot.findByIdAndUpdate(slotId, { $inc: { bookedCount: 1 } });

    await booking.populate([
      { path: 'slot', populate: { path: 'hospital', select: 'name city' } },
      { path: 'user', select: 'name email' },
    ]);

    await Notification.create({
      user: userId,
      title: 'Booking Submitted',
      message: `Your donation booking at ${slot.hospital.name} on ${new Date(slot.date).toDateString()} is pending approval.`,
      type: 'booking',
    });

    res.status(201).json({ success: true, message: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/bookings/my  [user]
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'slot', populate: { path: 'hospital', select: 'name city address' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/bookings  [admin]
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('user', 'name email bloodGroup city')
      .populate({ path: 'slot', populate: { path: 'hospital', select: 'name city' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);
    res.json({ success: true, bookings, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PATCH /api/bookings/:id/status  [admin]
const updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('user', 'name email').populate({ path: 'slot', populate: { path: 'hospital', select: 'name city' } });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Update lastDonationDate and totalDonations on completion
    if (status === 'completed') {
      await User.findByIdAndUpdate(booking.user._id, {
        lastDonationDate: new Date(),
        $inc: { totalDonations: 1 },
      });
    }

    // Refund slot spot if rejected or cancelled
    if (status === 'rejected' || status === 'cancelled') {
      await Slot.findByIdAndUpdate(booking.slot._id, { $inc: { bookedCount: -1 } });
    }

    await Notification.create({
      user: booking.user._id,
      title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your donation booking has been ${status}.${adminNote ? ' Note: ' + adminNote : ''}`,
      type: status === 'approved' ? 'approval' : status === 'rejected' ? 'rejection' : 'booking',
    });

    res.json({ success: true, message: `Booking ${status}`, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/bookings/:id  [user - cancel own]
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();
    await Slot.findByIdAndUpdate(booking.slot, { $inc: { bookedCount: -1 } });

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus, cancelBooking };
