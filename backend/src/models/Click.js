const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    browser: String,
    os: String,
    deviceType: String,
    referrer: String,
    ip: String,
  },
  { versionKey: false }
);

module.exports = mongoose.model('Click', ClickSchema);
