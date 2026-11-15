const axios = require('axios');

// 1. Get all mutual funds for search / directory
exports.getAllMutualFunds = async (req, res) => {
    try {
        const response = await axios.get('https://api.mfapi.in/mf');
        // Returns an array of objects: [{code: 120503, name: "Aditya Sun Life...", ISIN: "...", ...}]
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
        
        // response.data contains { meta: { fund_house, scheme_type, scheme_category, scheme_name }, data: [{date, nav}, ...] }
        const mfData = response.data;

        if (!mfData || !mfData.data || mfData.data.length === 0) {
            return res.status(404).json({ error: 'Mutual fund scheme not found' });
        }

        // Calculate basic returns if historical data exists
        const navList = mfData.data;
        const currentNav = parseFloat(navList[0].nav);
        
        // Helper to find NAV approx 1 year or 3 years ago if available
        // Note: MFapi data is sorted latest date first
        let oneYearNav = navList.length > 250 ? parseFloat(navList[250].nav) : currentNav;
        let threeYearNav = navList.length > 750 ? parseFloat(navList[750].nav) : oneYearNav;

        let return1Y = (((currentNav - oneYearNav) / oneYearNav) * 100).toFixed(2);
        let return3Y = (Math.pow((currentNav / threeYearNav), (1 / 3)) - 1) * 100;
        return3Y = isNaN(return3Y) ? 'N/A' : return3Y.toFixed(2);

        res.json({
            meta: mfData.meta,
            currentNav,
            return1Y: `${return1Y}%`,
            return3Y: `${return3Y}%`,
            historicalNav: navList // Array of {date: "DD-MM-YYYY", nav: "..."} for charts
        });
    } catch (error) {
        console.error('Error fetching mutual fund details:', error.message);
        res.status(500).json({ error: 'Failed to fetch mutual fund details' });
    }
};