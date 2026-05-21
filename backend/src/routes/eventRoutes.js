const express = require('express');
const router = express.Router();

const { getAllEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');

router.get('/', getAllEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;