const express = require('express');
const router = express.Router();
const { getAllMutualFunds, getMutualFundDetails } = require('../controllers/mutualFundController');

router.get('/', getAllMutualFunds);
router.get('/:schemeCode', getMutualFundDetails);

module.exports = router;