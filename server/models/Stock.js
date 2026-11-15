const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true }, // e.g., "RELIANCE.NS"
  name: { type: String, required: true },                 // e.g., "Reliance Industries Ltd."
  exchange: { type: String, enum: ['NSE', 'BSE'], required: true },
  sector: { type: String, default: 'General' },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Stock', StockSchema);