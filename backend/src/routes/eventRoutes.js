const express = require('express');
const router = express.Router();

const { getAllEvents, getApprovedEvents, getPendingEvents, createEvent, updateEvent, approveEvent, deleteEvent } = require('../controllers/eventController');

router.get('/', getAllEvents);
router.get('/approved', getApprovedEvents);
router.get('/pending', getPendingEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.patch('/:id/approve', approveEvent);
router.delete('/:id', deleteEvent);

module.exports = router;