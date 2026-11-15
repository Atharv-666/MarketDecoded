const axios = require('axios');

let masterStockList = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Limited', exchange: 'NSE', sector: 'Energy' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Limited', exchange: 'NSE', sector: 'IT' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'INFY.NS', name: 'Infosys Limited', exchange: 'NSE', sector: 'IT' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'TMPV.NS', name: 'Tata Motors Passenger Vehicles Limited', exchange: 'NSE', sector: 'Automobile' },
  { symbol: 'TMCV.NS', name: 'Tata Motors Commercial Vehicles Limited', exchange: 'NSE', sector: 'Automobile' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Limited', exchange: 'NSE', sector: 'Telecom' },
  { symbol: 'ITC.NS', name: 'ITC Limited', exchange: 'NSE', sector: 'FMCG' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro Limited', exchange: 'NSE', sector: 'Construction' },
  { symbol: 'ETERNAL.NS', name: 'Eternal Limited (formerly Zomato)', exchange: 'NSE', sector: 'Consumer Tech' },
  { symbol: 'SUZLON.NS', name: 'Suzlon Energy Limited', exchange: 'NSE', sector: 'Power' },
  { symbol: 'IRCTC.NS', name: 'Indian Railway Catering And Tourism Corporation Limited', exchange: 'NSE', sector: 'Travel' },
  { symbol: '^NSEI', name: 'NIFTY 50 Index', exchange: 'INDEX', sector: 'Benchmark' },
  { symbol: '^BSESN', name: 'S&P BSE SENSEX Index', exchange: 'INDEX', sector: 'Benchmark' },
  { symbol: '^NSEBANK', name: 'NIFTY Bank Index', exchange: 'INDEX', sector: 'Banking Index' },
];

async function loadOfficialNSEDirectory() {
  try {
    const response = await axios.get('https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/csv',
      },
      timeout: 8000,
    });

    const lines = response.data.split('\n').slice(1);
    const parsedStocks = [];

    for (const line of lines) {
      const cols = line.split(',');
      if (cols.length >= 2) {
        const rawSymbol = cols[0].replace(/"/g, '').trim();
        const companyName = cols[1].replace(/"/g, '').trim();
        if (rawSymbol && companyName) {
          parsedStocks.push({
            symbol: `${rawSymbol}.NS`,
            name: companyName,
            exchange: 'NSE',
            sector: 'Equity',
          });
        }
      }
    }

    if (parsedStocks.length > 500) {
      const existingSymbols = new Set(masterStockList.map(s => s.symbol));
      for (const stock of parsedStocks) {
        if (!existingSymbols.has(stock.symbol)) {
          masterStockList.push(stock);
          existingSymbols.add(stock.symbol);
        }
      }
      console.log(`✅ Loaded ${masterStockList.length} Indian equities into search directory.`);
    }
  } catch (err) {
    console.warn('⚠️ Could not fetch live NSE CSV (using fallback + Yahoo live search):', err.message);
  }
}

loadOfficialNSEDirectory();

function getDirectory() {
  return masterStockList;
}

module.exports = { getDirectory };