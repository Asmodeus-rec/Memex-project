# 🌀 Memex — Cross-Chain Memecoin Market Index Token (Compiled Developer Bundle)

**Memex** is an experimental cross-chain memecoin designed to track and reflect the overall performance of the memecoin market.  
This package is a compiled developer bundle containing everything needed to deploy and test Memex on Ethereum (Sepolia) and Solana (Devnet).

---

## 📦 What this bundle includes
- `contracts/MemexToken.sol` — ERC20 contract with safe mint/burn and 5% per-op cap
- `indexer/indexer.js` — Node.js indexer that fetches CoinGecko data and triggers mint/burn on Ethereum and mirrors on Solana
- `scripts/deploy.js` — Hardhat deploy script for Sepolia
- `test/test_memex.js` — Basic Hardhat test
- `hardhat.config.js`, `package.json`, `.env.example`, `.gitignore`, `LICENSE`
- `assets/logo.png` — placeholder logo file

---

## ⚠️ Important Safety Notes
- **This bundle is configured to perform real mint/burn transactions** (Option A). Use only on testnets unless you fully understand the financial and security implications.
- **Owner account must be a multisig in production.** Do NOT use an exposed single private key on mainnet.
- Always test locally and on Sepolia/Devnet before any mainnet usage.

---

## 🔧 Quick start (Sepolia + Solana Devnet)

1. Install dependencies
```bash
npm install
```

2. Create `.env` from `.env.example` and fill keys (use testnet keys):
```bash
cp .env.example .env
# Edit .env with your PRIVATE_KEY, ETH_RPC_URL, MEMEX_CONTRACT_ADDRESS (after deployment), and Solana keypair path
```

3. Deploy Memex to Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
# copy the deployed contract address into .env as MEMEX_CONTRACT_ADDRESS
```

4. Create or copy your Solana keypair JSON to the path in .env (SOLANA_KEYPAIR_PATH). Fund the wallet on Devnet.

5. Start the indexer (it will perform real transactions per index signals)
```bash
node indexer/indexer.js
```

---

## 🔭 Cross-chain behavior (high level)
- The indexer computes a weighted memecoin index from CoinGecko data.
- When index change exceeds the configured threshold, the indexer computes a supply adjustment capped by contract max (5% default) and executes `safeMint` or `safeBurn` on Ethereum.
- Optionally the same event can be mirrored by minting/burning an SPL token on Solana to simulate cross-chain reflection. The included code provides placeholders and guidance for SPL mint/burn flows.

---

## 🧩 How to customize
- Edit `indexer/indexer.js` to change CoinGecko query parameters or index weighting.
- Adjust `INDEX_THRESHOLD_BPS` and `MAX_ADJUST_BPS` in `.env` to tune sensitivity.
- Replace owner address with a multisig contract for production governance.

---

## 🧑‍💻 Developer contacts
**Samuel Bright Ososelase Ozallo** (Asmodeus) — officialmemex.project@gmail.com

---

## License
MIT License © 2025 Samuel Bright Ososelase Ozallo
