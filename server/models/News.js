const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  ticker: { type: String, required: true }, // e.g., "RELIANCE.NS"
  headline: { type: String, required: true },
  source: { type: String },
  url: { type: String },
  publishedAt: { type: Date, default: Date.now },
  sentimentScore: { type: Number, default: 0.0 }, // Range: -1.0 to +1.0
  sentimentLabel: { type: String, enum: ['Bullish', 'Bearish', 'Neutral'], default: 'Neutral' }
});

module.exports = mongoose.model('News', NewsSchema);