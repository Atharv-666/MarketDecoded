const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const { getDirectory } = require('../utils/stockDirectory');

const LEGACY_SYMBOL_MAP = {
  'TATAMOTORS.NS': 'TMPV.NS',
  'TATAMOTORS.BO': 'TMPV.BO',
  'ZOMATO.NS': 'ETERNAL.NS',
  'ZOMATO.BO': 'ETERNAL.BO',
};

function normalizeIndianSymbol(rawSymbol) {
  let cleanSymbol = rawSymbol.toUpperCase().trim();
  if (cleanSymbol.endsWith('.BSE') || cleanSymbol.endsWith('.BOSE')) {
    cleanSymbol = cleanSymbol.replace(/\.BSE$|\.BOSE$/, '.BO');
  } else if (!cleanSymbol.endsWith('.NS') && !cleanSymbol.endsWith('.BO') && !cleanSymbol.startsWith('^')) {
    cleanSymbol += '.NS';
  }
  return LEGACY_SYMBOL_MAP[cleanSymbol] || cleanSymbol;
}

exports.getHistoricalCandles = async (req, res) => {
  try {
    const { symbol } = req.params;
    const range = (req.query.range || '6m').toLowerCase();
    const cleanSymbol = normalizeIndianSymbol(symbol);

    let daysBack = 180;
    let interval = '1d';
    const isIntraday = range === '1d' || range === '1w';

    switch (range) {
      case '1d': daysBack = 4; interval = '5m'; break;
      case '1w': daysBack = 7; interval = '30m'; break;
      case '1m': daysBack = 30; break;
      case '3m': daysBack = 90; break;
      case '6m': daysBack = 180; break;
      case '1y': daysBack = 365; break;
      case '3y': daysBack = 1095; break;
      case '5y': daysBack = 1825; break;
      case 'all': daysBack = 3650; break;
      default: daysBack = 180;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysBack);

    const threeYearsAgo = new Date();
    threeYearsAgo.setDate(endDate.getDate() - 1095);

    const [quoteResult, chartResult, cagrChartResult] = await Promise.all([
      yahooFinance.quote(cleanSymbol).catch(() => null),
      yahooFinance.chart(cleanSymbol, { period1: startDate, period2: endDate, interval }).catch(() => null),
      yahooFinance.chart(cleanSymbol, { period1: threeYearsAgo, period2: endDate, interval: '1d' }).catch(() => null),
    ]);

    let rawQuotes = (chartResult?.quotes || []).filter(item => item.close !== null && item.close !== undefined);

    if (range === '1d' && rawQuotes.length > 0) {
      const latestDay = new Date(rawQuotes[rawQuotes.length - 1].date).toISOString().split('T')[0];
      rawQuotes = rawQuotes.filter(item => new Date(item.date).toISOString().split('T')[0] === latestDay);
    }

    const seenTimes = new Set();
    const formattedData = [];

    for (const item of rawQuotes) {
      const d = new Date(item.date);
      const timeKey = isIntraday
        ? Math.floor(d.getTime() / 1000) + 19800
        : d.toISOString().split('T')[0];

      if (!seenTimes.has(timeKey)) {
        seenTimes.add(timeKey);
        formattedData.push({
          time: timeKey,
          open: parseFloat((item.open ?? item.close).toFixed(2)),
          high: parseFloat((item.high ?? item.close).toFixed(2)),
          low: parseFloat((item.low ?? item.close).toFixed(2)),
          close: parseFloat(item.close.toFixed(2)),
        });
      }
    }

    const currentPrice = quoteResult?.regularMarketPrice
      || (formattedData.length ? formattedData[formattedData.length - 1].close : 0);

    if (!currentPrice || formattedData.length === 0) {
      return res.status(404).json({
        error: `No active market data found for "${cleanSymbol}". The stock may be delisted, suspended, or renamed.`,
      });
    }

    const startPrice = formattedData[0].close;
    const rangeChange = parseFloat((currentPrice - startPrice).toFixed(2));
    const rangePercent = startPrice > 0 ? parseFloat(((rangeChange / startPrice) * 100).toFixed(2)) : 0;

    let annualReturnRate = 14.5;
    const cagrQuotes = (cagrChartResult?.quotes || []).filter(q => q.close !== null && q.close !== undefined);
    if (cagrQuotes.length > 10) {
      const oldestClose = cagrQuotes[0].close;
      const latestClose = currentPrice || cagrQuotes[cagrQuotes.length - 1].close;
      const yearsSpan = Math.max(
        (new Date(cagrQuotes[cagrQuotes.length - 1].date) - new Date(cagrQuotes[0].date)) / (1000 * 60 * 60 * 24 * 365.25),
        0.5
      );
      if (oldestClose > 0 && latestClose > 0) {
        const cagr = (Math.pow(latestClose / oldestClose, 1 / yearsSpan) - 1) * 100;
        annualReturnRate = parseFloat(Math.min(Math.max(cagr, 1), 50).toFixed(1));
      }
    }

    res.json({
      symbol: cleanSymbol,
      companyName: quoteResult?.shortName || quoteResult?.longName || cleanSymbol.replace(/\.(NS|BO)$/, ''),
      exchange: cleanSymbol.endsWith('.BO') ? 'BSE' : cleanSymbol.startsWith('^') ? 'INDEX' : 'NSE',
      livePrice: parseFloat(currentPrice.toFixed(2)),
      dayChange: parseFloat((quoteResult?.regularMarketChange || 0).toFixed(2)),
      dayChangePercent: parseFloat((quoteResult?.regularMarketChangePercent || 0).toFixed(2)),
      rangeChange,
      rangePercent,
      annualReturnRate,
      range: range.toUpperCase(),
      candles: formattedData
    });

  } catch (error) {
    console.error('Error fetching terminal data:', error.message);
    res.status(500).json({ error: 'Failed to load stock terminal data' });
  }
};

exports.searchStocks = async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.json([]);
    }

    const upperQuery = query.toUpperCase();
    const directory = getDirectory();

    const localMatches = directory.filter(
      (stock) =>
        stock.symbol.toUpperCase().includes(upperQuery) ||
        stock.name.toUpperCase().includes(upperQuery)
    );

    const yahooResult = await yahooFinance.search(query, {
      quotesCount: 25,
      newsCount: 0,
      region: 'IN',
    }).catch(() => ({ quotes: [] }));

    const seenSymbols = new Set();
    const combinedResults = [];

    for (const item of localMatches) {
      if (!seenSymbols.has(item.symbol)) {
        seenSymbols.add(item.symbol);
        combinedResults.push(item);
      }
    }

    for (const item of yahooResult.quotes || []) {
      if (!item.symbol || seenSymbols.has(item.symbol)) continue;

      const isIndian =
        item.symbol.endsWith('.NS') ||
        item.symbol.endsWith('.BO') ||
        item.symbol.startsWith('^') ||
        item.exchange === 'NSI' ||
        item.exchange === 'BSE';

      if (isIndian) {
        const mappedSymbol = LEGACY_SYMBOL_MAP[item.symbol] || item.symbol;
        if (!seenSymbols.has(mappedSymbol)) {
          seenSymbols.add(mappedSymbol);
          combinedResults.push({
            symbol: mappedSymbol,
            name: item.shortname || item.longname || mappedSymbol,
            sector: item.sector || item.quoteType || 'Equity',
            exchange: mappedSymbol.endsWith('.BO') ? 'BSE' : mappedSymbol.startsWith('^') ? 'INDEX' : 'NSE',
          });
        }
      }
    }

    combinedResults.sort((a, b) => {
      const aClean = a.symbol.replace(/\.(NS|BO)$/, '');
      const bClean = b.symbol.replace(/\.(NS|BO)$/, '');

      if (aClean === upperQuery && bClean !== upperQuery) return -1;
      if (bClean === upperQuery && aClean !== upperQuery) return 1;

      const aStarts = aClean.startsWith(upperQuery) || a.name.toUpperCase().startsWith(upperQuery) ? 1 : 0;
      const bStarts = bClean.startsWith(upperQuery) || b.name.toUpperCase().startsWith(upperQuery) ? 1 : 0;
      return bStarts - aStarts;
    });

    res.json(combinedResults.slice(0, 50));
  } catch (error) {
    console.error('Stock search error:', error.message);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
};

exports.getIndexOverview = async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.toUpperCase().trim();

    const [quoteResult, chartResult] = await Promise.all([
      yahooFinance.quote(cleanSymbol).catch(() => null),
      yahooFinance.chart(cleanSymbol, { period1: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), interval: '1d' }).catch(() => null),
    ]);

    let rawQuotes = (chartResult?.quotes || []).filter(item => item.close !== null && item.close !== undefined);
    const currentPrice = quoteResult?.regularMarketPrice || (rawQuotes.length ? rawQuotes[rawQuotes.length - 1].close : 0);
    const startPrice = rawQuotes.length ? rawQuotes[0].close : currentPrice;
    const rangeChange = parseFloat((currentPrice - startPrice).toFixed(2));
    const rangePercent = startPrice > 0 ? parseFloat(((rangeChange / startPrice) * 100).toFixed(2)) : 0;

    const formattedData = rawQuotes.map(item => ({
      time: new Date(item.date).toISOString().split('T')[0],
      value: parseFloat(item.close.toFixed(2)),
    }));

    let sidebarItems = [];
    if (cleanSymbol === '^NSEI' || cleanSymbol === '^BSESN') {
      sidebarItems = [
        { title: `${cleanSymbol === '^NSEI' ? 'NIFTY' : 'SENSEX'} 25300 Call`, price: '₹179.10', change: '-2.50%', isUp: false },
        { title: `${cleanSymbol === '^NSEI' ? 'NIFTY' : 'SENSEX'} 25300 Put`, price: '₹188.25', change: '-34.65%', isUp: false },
        { title: `${cleanSymbol === '^NSEI' ? 'NIFTY' : 'SENSEX'} 25200 Put`, price: '₹140.10', change: '-39.75%', isUp: false },
        { title: `${cleanSymbol === '^NSEI' ? 'NIFTY' : 'SENSEX'} 25000 Put`, price: '₹69.05', change: '-51.56%', isUp: false },
      ];
    } else {
      sidebarItems = [
        { title: 'Top Constituent 1', price: '₹2,450.00', change: '+1.45%', isUp: true },
        { title: 'Top Constituent 2', price: '₹1,210.50', change: '+0.80%', isUp: true },
      ];
    }

    res.json({
      symbol: cleanSymbol,
      name: quoteResult?.shortName || quoteResult?.longName || (cleanSymbol === '^NSEI' ? 'Nifty 50' : cleanSymbol === '^BSESN' ? 'S&P BSE Sensex' : cleanSymbol),
      livePrice: parseFloat(currentPrice.toFixed(2)),
      dayChange: parseFloat((quoteResult?.regularMarketChange || 0).toFixed(2)),
      dayChangePercent: parseFloat((quoteResult?.regularMarketChangePercent || 0).toFixed(2)),
      rangeChange,
      rangePercent,
      candles: formattedData,
      sidebarItems,
    });
  } catch (error) {
    console.error('Index overview error:', error.message);
    res.status(500).json({ error: 'Failed to fetch index details' });
  }
};