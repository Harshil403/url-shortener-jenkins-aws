const { nanoid } = require('nanoid');
const UAParser = require('ua-parser-js');
const Url = require('../models/Url');
const Click = require('../models/Click');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// POST /api/shorten
exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customCode } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'originalUrl is required' });
    }

    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const shortCode = customCode || nanoid(7);

    const existing = await Url.findOne({ shortCode });
    if (existing) {
      return res.status(409).json({ error: 'Short code already in use' });
    }

    const url = await Url.create({ originalUrl, shortCode });

    return res.status(201).json({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${BASE_URL}/${url.shortCode}`,
      createdAt: url.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /:shortCode  -> redirect + log click
exports.redirectShortUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Fire-and-forget analytics log
    const parser = new UAParser(req.headers['user-agent']);
    const uaResult = parser.getResult();

    Click.create({
      shortCode,
      browser: uaResult.browser.name || 'unknown',
      os: uaResult.os.name || 'unknown',
      deviceType: uaResult.device.type || 'desktop',
      referrer: req.headers.referer || 'direct',
      ip: req.ip,
    }).catch((e) => console.error('Click log error:', e.message));

    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/urls  -> list all short urls (for dashboard)
exports.listUrls = async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    return res.json(
      urls.map((u) => ({
        originalUrl: u.originalUrl,
        shortCode: u.shortCode,
        shortUrl: `${BASE_URL}/${u.shortCode}`,
        clicks: u.clicks,
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
