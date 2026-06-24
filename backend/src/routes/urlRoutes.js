const express = require('express');
const router = express.Router();
const { createShortUrl, listUrls } = require('../controllers/urlController');

router.post('/shorten', createShortUrl);
router.get('/urls', listUrls);

module.exports = router;
