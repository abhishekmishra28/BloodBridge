const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests, getAllRequests, searchRequests, updateRequestStatus } = require('../controllers/requestController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/search', protect, searchRequests);
router.get('/', protect, adminOnly, getAllRequests);
router.patch('/:id/status', protect, adminOnly, updateRequestStatus);

module.exports = router;
