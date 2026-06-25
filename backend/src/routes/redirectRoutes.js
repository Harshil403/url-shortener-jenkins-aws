const express = require('express');
const router = express.Router();
const { redirectShortUrl } = require('../controllers/urlController');

router.get('/r/:shortCode', redirectShortUrl);

module.exports = router;