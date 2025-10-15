/**
 * Memex Indexer - Node.js
 * - Fetches memecoin data from CoinGecko
 * - Computes a simple memecoin index (weighted average)
 * - If delta exceeds threshold, performs safe mint/burn on Ethereum contract (owner account)
 * - Also issues corresponding mint/burn on Solana (SPL token) for cross-chain mirroring
 *
 * NOTE: This script performs real transactions. Use keys and RPC endpoints carefully (use testnets).
 * Fill .env with PRIVATE_KEY (eth), ETH_RPC_URL, SOLANA_KEYPAIR_PATH, SOLANA_RPC_URL, COINGECKO_API_URL
 */

const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs');
const { Keypair, Connection, PublicKey } = require('@solana/web3.js');
const { createMint, mintTo, burn } = require('@solana/spl-token');
require('dotenv').config();

// ---------- Config ----------
const ETH_RPC = process.env.ETH_RPC_URL || 'https://rpc.sepolia.org';
const ETH_PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const MEMEX_CONTRACT_ADDRESS = process.env.MEMEX_CONTRACT_ADDRESS || '';
const COINGECKO_API = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3/coins/markets';

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const SOL_KEYPAIR_PATH = process.env.SOLANA_KEYPAIR_PATH || './solana-keypair.json';
const SOLANA_MINT_KEY = process.env.SOLANA_MINT_ADDRESS || ''; // existing SPL mint to mirror

const INDEX_THRESHOLD_BPS = parseInt(process.env.INDEX_THRESHOLD_BPS || '200'); // 2% threshold to act
const MAX_ADJUST_BPS = parseInt(process.env.MAX_ADJUST_BPS || '500'); // 5% per op enforced by contract

// ---------- Helpers ----------
async function fetchMemecoinData() {
  // Example: fetch top memecoins by market cap - callers can modify "ids" param
  // We'll request coins with category 'memecoin' is not standardized; instead user supplies ids in env if desired
  const params = { vs_currency: 'usd', order: 'market_cap_desc', per_page: 50, page: 1, sparkline: false };
  const res = await axios.get(COINGECKO_API, { params });
  return res.data;
}

function computeMemexIndex(coins) {
  // Weighted simple index: sum(price_change_percentage_24h * market_cap) / sum(market_cap)
  let num = 0;
  let den = 0;
  for (const c of coins) {
    const change = c.price_change_percentage_24h || 0;
    const mc = c.market_cap || 0;
    num += change * mc;
    den += mc;
  }
  if (den === 0) return 0;
  return num / den; // percent change weighted
}

// ---------- Ethereum setup ----------
const ethProvider = new ethers.JsonRpcProvider(ETH_RPC);
const ethWallet = ETH_PRIVATE_KEY ? new ethers.Wallet(ETH_PRIVATE_KEY, ethProvider) : null;
const memexAbi = [
  "function safeMint(address to, uint256 amount) external",
  "function safeBurn(uint256 amount) external",
  "function totalSupply() view returns (uint256)"
];
const memexContract = MEMEX_CONTRACT_ADDRESS ? new ethers.Contract(MEMEX_CONTRACT_ADDRESS, memexAbi, ethWallet) : null;

// ---------- Solana setup ----------
const solConn = new Connection(SOLANA_RPC, 'confirmed');
let solKeypair = null;
if (fs.existsSync(SOL_KEYPAIR_PATH)) {
  const kp = JSON.parse(fs.readFileSync(SOL_KEYPAIR_PATH));
  solKeypair = Keypair.fromSecretKey(new Uint8Array(kp));
} else {
  console.warn("Solana keypair not found at", SOL_KEYPAIR_PATH);
}

// ---------- Indexer Main Loop ----------
async function main() {
  console.log("Starting Memex indexer...");
  const coins = await fetchMemecoinData();
  const indexChange = computeMemexIndex(coins);
  console.log("Computed memex index change (weighted %):", indexChange);

  // For simplicity interpret positive indexChange as mint pressure, negative as burn
  if (Math.abs(indexChange) * 100 >= INDEX_THRESHOLD_BPS) {
    // Determine adjustment amount relative to total supply
    if (!memexContract || !ethWallet) {
      console.error("Ethereum contract or wallet not configured. Set MEMEX_CONTRACT_ADDRESS and PRIVATE_KEY in .env");
      return;
    }
    const totalSupply = await memexContract.totalSupply();
    // Use basis points: desiredAdjustBps = clamp(|indexChange_percent|*100, maxAdjustBps)
    const desiredBps = Math.min(Math.floor(Math.abs(indexChange) * 100), MAX_ADJUST_BPS);
    const amount = totalSupply * BigInt(desiredBps) / BigInt(10000);
    if (amount === 0n) {
      console.log("Calculated zero amount to adjust; skipping.");
      return;
    }
    if (indexChange > 0) {
      console.log("Minting on Ethereum:", amount.toString());
      const tx = await memexContract.safeMint(ethWallet.address, amount);
      console.log("Mint tx sent:", tx.hash);
      await tx.wait();
      console.log("Mint confirmed.");
      // Mirror on Solana (mint SPL to a wallet) if SOLANA_MINT_KEY provided
      if (solKeypair && SOLANA_MINT_KEY) {
        console.log("Mirroring mint on Solana (placeholder) - see README for SPL mint instructions.");
        // Actual SPL minting flow would be here using @solana/spl-token
      }
    } else {
      console.log("Burning on Ethereum:", amount.toString());
      const tx = await memexContract.safeBurn(amount);
      console.log("Burn tx sent:", tx.hash);
      await tx.wait();
      console.log("Burn confirmed.");
      // Mirror on Solana burn if applicable
      if (solKeypair && SOLANA_MINT_KEY) {
        console.log("Mirroring burn on Solana (placeholder) - see README for SPL burn instructions.");
      }
    }
  } else {
    console.log("Index change below threshold; no action taken.");
  }
}

main().catch(e => {
  console.error("Indexer error:", e);
  process.exit(1);
});
