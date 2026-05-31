const express = require('express');
const router = express.Router();
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const { getAllEvents, getApprovedEvents, getPendingEvents, getEventById, createEvent, updateEvent, approveEvent, deleteEvent } = require('../controllers/eventController');

router.get('/', authMiddleware, adminMiddleware, getAllEvents);
router.get('/approved', authMiddleware, getApprovedEvents);
router.get('/pending', authMiddleware, adminMiddleware, getPendingEvents);
router.get('/:id', authMiddleware, getEventById);
router.post('/', authMiddleware, adminMiddleware, createEvent);
router.put('/:id', authMiddleware, adminMiddleware, updateEvent);
router.patch('/:id/approve', authMiddleware, adminMiddleware, approveEvent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);

module.exports = router;