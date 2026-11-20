const axios = require('axios');

// 1. Get all mutual funds for search / directory
exports.getAllMutualFunds = async (req, res) => {
  try {
    const response = await axios.get('https://api.mfapi.in/mf');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching mutual fund list:', error.message);
    res.status(500).json({ error: 'Failed to fetch mutual funds directory' });
  }
};

// 2. Get specific fund details and historical NAV for charting & CAGR
exports.getMutualFundDetails = async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const response = await axios.get(`https://api.mfapi.in/mf/${schemeCode}`);

    const mfData = response.data;

    if (!mfData || !Array.isArray(mfData.data) || mfData.data.length === 0) {
      return res.status(404).json({ error: 'Mutual fund scheme not found' });
    }

    const navList = mfData.data;
    const currentNav = parseFloat(navList[0]?.nav);
    if (!Number.isFinite(currentNav) || currentNav <= 0) {
      return res.status(400).json({ error: 'Invalid latest NAV for this scheme' });
    }

    const oneYearNav =
      navList.length > 250 && Number.isFinite(parseFloat(navList[250]?.nav))
        ? parseFloat(navList[250].nav)
        : currentNav;

    const threeYearNav =
      navList.length > 750 && Number.isFinite(parseFloat(navList[750]?.nav))
        ? parseFloat(navList[750].nav)
        : oneYearNav;

    const return1Y =
      oneYearNav > 0 ? `${(((currentNav - oneYearNav) / oneYearNav) * 100).toFixed(2)}%` : 'N/A';

    const raw3Y =
      threeYearNav > 0 ? (Math.pow(currentNav / threeYearNav, 1 / 3) - 1) * 100 : NaN;
    const return3Y = Number.isFinite(raw3Y) ? `${raw3Y.toFixed(2)}%` : 'N/A';

    res.json({
      meta: mfData.meta,
      currentNav,
      return1Y,
      return3Y,
      historicalNav: navList,
    });
  } catch (error) {
    console.error('Error fetching mutual fund details:', error.message);
    res.status(500).json({ error: 'Failed to fetch mutual fund details' });
  }
};