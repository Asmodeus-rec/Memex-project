🪙 MEMEX — Cross-Chain Memecoin Index Project

Developer: Samuel Bright Ososelase Ozallo (alias Asmodeus)
Email: officialmemex.project@gmail.com
Origin: Edo State, Nigeria
Focus: Cross-chain memecoin index and adaptive supply token


---

🧠 Overview

Memex is a cross-chain memecoin designed to track and reflect the overall performance of the memecoin market.
It combines an Ethereum ERC20 token with an off-chain Node.js indexer and optional Solana integration to adjust token supply dynamically based on memecoin index data.


---

⚙️ Core Features

Dynamic Supply ERC20 Token: Supply adjusts based on a memecoin market index.

Off-chain Node.js Indexer: Fetches data from CoinGecko and triggers safe mint/burn events.

Cross-Chain Ready: Optional Solana devnet integration for multi-chain liquidity.

Safety Controls:

pause/unpause mechanism

Max 5% supply adjustment per operation

Multisig and rate-limiting recommendations




---

🧩 Technical Stack

Ethereum: Solidity, Hardhat, Sepolia Testnet

Off-chain: Node.js, CoinGecko API

Cross-chain (optional): Solana (Rust SDK + Web3.js)

Scripts: Deployment + Indexer automation

Security: Role-based access + rate-limited execution



---

🗂️ Project Structure

memex/
│
├── contracts/
│   └── MemexToken.sol        # ERC20 contract with adaptive supply logic
│
├── scripts/
│   ├── deploy.js             # Deploys token to Sepolia testnet
│   └── test_indexer.js       # Simulates index-based supply adjustment
│
├── indexer/
│   └── memex_indexer.js      # Node.js script fetching CoinGecko memecoin data
│
├── test/
│   └── memex.test.js         # Hardhat unit tests for mint/burn logic
│
├── .gitignore
├── hardhat.config.js
├── package.json
└── README.md


---

🚀 How to Run Locally

# 1️⃣ Clone the repository
git clone https://github.com/ASMODEUS-REC/memex.git

# 2️⃣ Install dependencies
npm install

# 3️⃣ Compile smart contracts
npx hardhat compile

# 4️⃣ Run test suite
npx hardhat test

# 5️⃣ Start the off-chain indexer
node indexer/memex_indexer.js


---

🧪 Testing on Sepolia

Use your Alchemy or Infura RPC key and a funded wallet.
Update your .env file:

PRIVATE_KEY=your_wallet_private_key
API_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

Then deploy:

npx hardhat run scripts/deploy.js --network sepolia


---

🔗 Future Plans

DAO governance integration

Enhanced oracle-based pricing

Cross-chain liquidity sync (Ethereum ↔ Solana ↔ Base)

On-chain index publishing



---

📜 License

MIT License — free to use, modify, and build upon with credit.
