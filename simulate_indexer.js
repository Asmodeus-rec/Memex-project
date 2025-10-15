// Simple simulation runner that logs what the indexer would do without performing txs.
// Usage: node indexer/simulate_indexer.js

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const COINGECKO_API = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3/coins/markets';

async function fetch() {
  const res = await axios.get(COINGECKO_API, { params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 50, page: 1, sparkline: false } });
  const coins = res.data;
  let num = 0, den = 0;
  for (const c of coins) {
    const change = c.price_change_percentage_24h || 0;
    const mc = c.market_cap || 0;
    num += change * mc;
    den += mc;
  }
  const idx = den === 0 ? 0 : num / den;
  console.log('Simulated Memex index (weighted %):', idx);
}

fetch().catch(e=>console.error(e));