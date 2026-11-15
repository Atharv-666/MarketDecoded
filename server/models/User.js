const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isEligibleForDemo: { type: Boolean, default: false }, // Updated after passing risk check
  virtualBalance: { type: Number, default: 1000000.00 }, // Initial ₹10,00,000 for paper trading
  watchlist: [{ type: String }], // Array of tickers e.g., ["RELIANCE.NS", "TCS.NS"]
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);