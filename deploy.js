const hre = require('hardhat');
require('dotenv').config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const initialSupply = hre.ethers.parseUnits("1000000", 18); // 1,000,000 initial
  const Memex = await hre.ethers.getContractFactory("MemexToken");
  const memex = await Memex.deploy("Memex Token", "MEMEX", initialSupply);
  await memex.waitForDeployment();
  console.log("Memex deployed to:", memex.target);

  console.log("Done. Add the contract address to .env as MEMEX_CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
