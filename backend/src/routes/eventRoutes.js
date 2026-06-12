const express = require('express');
const router = express.Router();
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const { getAllEvents, getApprovedEvents, getPendingEvents, getAllPendingEvents, getGroupedPendingEvents, getEventById, createEvent, updateEvent, approveEvent, approveManyEvents, deleteEvent, deleteManyEvents } = require('../controllers/eventController');

router.get('/', authMiddleware, adminMiddleware, getAllEvents);
router.get('/approved', authMiddleware, getApprovedEvents);
router.get('/pending', authMiddleware, getPendingEvents);
router.get('/pending/all', authMiddleware, adminMiddleware, getAllPendingEvents);
router.get('/pending/grouped', authMiddleware, adminMiddleware, getGroupedPendingEvents);
router.get('/:id', authMiddleware, getEventById);
router.post('/', authMiddleware, adminMiddleware, createEvent);
router.put('/:id', authMiddleware, adminMiddleware, updateEvent);
router.patch('/:id/approve', authMiddleware, adminMiddleware, approveEvent);
router.patch('/approve-many', authMiddleware, adminMiddleware, approveManyEvents);
// Intersting fix..
router.delete('/delete-many', authMiddleware, adminMiddleware, deleteManyEvents);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);

module.exports = router;