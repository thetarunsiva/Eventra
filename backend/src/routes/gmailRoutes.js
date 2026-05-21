const express = require('express');
const router = express.Router();
const { testGmailFetch } = require('../controllers/gmailController');

router.get('/test', testGmailFetch);

module.exports = router;