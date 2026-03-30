const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, searchDonors } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/donors', protect, searchDonors);

module.exports = router;
