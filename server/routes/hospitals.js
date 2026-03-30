const express = require('express');
const router = express.Router();
const { getHospitals, getHospital, createHospital, updateHospital, deleteHospital } = require('../controllers/hospitalController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getHospitals);
router.get('/:id', protect, getHospital);
router.post('/', protect, adminOnly, createHospital);
router.put('/:id', protect, adminOnly, updateHospital);
router.delete('/:id', protect, adminOnly, deleteHospital);

module.exports = router;
