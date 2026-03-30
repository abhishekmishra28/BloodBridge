const Request = require('../models/Request');
const Notification = require('../models/Notification');

// @route POST /api/requests  [user]
const createRequest = async (req, res) => {
  try {
    const { patientName, bloodGroup, units, urgency, city, hospital, requiredDate, contactPhone, notes } = req.body;

    const request = await Request.create({
      requester: req.user._id,
      patientName, bloodGroup, units, urgency, city, hospital, requiredDate, contactPhone, notes,
    });

    await request.populate('requester', 'name email');

    res.status(201).json({ success: true, message: 'Blood request submitted', request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/requests/my  [user]
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/requests  [admin]
const getAllRequests = async (req, res) => {
  try {
    const { status, urgency, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;

    const requests = await Request.find(query)
      .populate('requester', 'name email phone city')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Request.countDocuments(query);
    res.json({ success: true, requests, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/requests/search?city=&bloodGroup=  [public/user]
const searchRequests = async (req, res) => {
  try {
    const { city, bloodGroup } = req.query;
    const query = { status: 'open' };
    if (city) query.city = new RegExp(city, 'i');
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const requests = await Request.find(query)
      .populate('requester', 'name phone')
      .sort({ urgency: 1, createdAt: -1 })
      .limit(50);

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PATCH /api/requests/:id/status  [admin]
const updateRequestStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('requester', 'name email');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    await Notification.create({
      user: request.requester._id,
      title: `Blood Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your blood request for ${request.bloodGroup} has been ${status}.${adminNote ? ' Note: ' + adminNote : ''}`,
      type: status === 'fulfilled' ? 'approval' : 'system',
    });

    res.json({ success: true, message: `Request updated to ${status}`, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, searchRequests, updateRequestStatus };
