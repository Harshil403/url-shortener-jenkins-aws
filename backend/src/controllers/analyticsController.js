const Url = require('../models/Url');
const Click = require('../models/Click');

// GET /api/analytics/:shortCode
exports.getAnalytics = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const clicks = await Click.find({ shortCode }).sort({ timestamp: -1 });

    const browserBreakdown = {};
    const osBreakdown = {};
    const deviceBreakdown = {};

    clicks.forEach((c) => {
      browserBreakdown[c.browser] = (browserBreakdown[c.browser] || 0) + 1;
      osBreakdown[c.os] = (osBreakdown[c.os] || 0) + 1;
      deviceBreakdown[c.deviceType] = (deviceBreakdown[c.deviceType] || 0) + 1;
    });

    return res.json({
      shortCode,
      originalUrl: url.originalUrl,
      totalClicks: url.clicks,
      browserBreakdown,
      osBreakdown,
      deviceBreakdown,
      recentClicks: clicks.slice(0, 20),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/analytics  -> overall stats across all urls
exports.getOverallAnalytics = async (req, res) => {
  try {
    const totalUrls = await Url.countDocuments();
    const totalClicks = await Click.countDocuments();

    const topUrls = await Url.find().sort({ clicks: -1 }).limit(5);

    return res.json({
      totalUrls,
      totalClicks,
      topUrls: topUrls.map((u) => ({
        shortCode: u.shortCode,
        originalUrl: u.originalUrl,
        clicks: u.clicks,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
