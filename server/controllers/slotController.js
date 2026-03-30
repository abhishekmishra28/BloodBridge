const Slot = require('../models/Slot');
const Hospital = require('../models/Hospital');

// @route GET /api/slots?hospitalId=&date=
const getSlots = async (req, res) => {
  try {
    const { hospitalId, date, city } = req.query;
    const query = { isActive: true };

    if (hospitalId) query.hospital = hospitalId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    let slots = await Slot.find(query).populate('hospital', 'name city address').sort({ date: 1, time: 1 });

    // Filter by city if provided
    if (city) {
      slots = slots.filter(s => s.hospital?.city?.toLowerCase().includes(city.toLowerCase()));
    }

    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/slots  [admin]
const createSlot = async (req, res) => {
  try {
    const { hospital, date, time, capacity } = req.body;
    const hosp = await Hospital.findById(hospital);
    if (!hosp) return res.status(404).json({ success: false, message: 'Hospital not found' });

    const slot = await Slot.create({ hospital, date, time, capacity });
    await slot.populate('hospital', 'name city address');
    res.status(201).json({ success: true, message: 'Slot created', slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/slots/:id  [admin]
const updateSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('hospital', 'name city');
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.json({ success: true, message: 'Slot updated', slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/slots/:id  [admin]
const deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.json({ success: true, message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSlots, createSlot, updateSlot, deleteSlot };
