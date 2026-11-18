const express = require('express');
const router = express.Router();
const { 
  searchStocks, 
  getIndexOverview, 
  getStockCandles 
} = require('../controllers/stockController');

router.get('/search', searchStocks);
router.get('/index/:symbol', getIndexOverview);
router.get('/candles/:symbol', getStockCandles);

module.exports = router;