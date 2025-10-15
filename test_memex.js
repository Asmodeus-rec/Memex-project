const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MemexToken", function () {
  it("Deploys and mints initial supply", async function () {
    const [owner] = await ethers.getSigners();
    const Memex = await ethers.getContractFactory("MemexToken");
    const memex = await Memex.deploy("Memex Token", "MEMEX", ethers.parseUnits("1000000", 18));
    await memex.waitForDeployment();
    const total = await memex.totalSupply();
    expect(total).to.equal(ethers.parseUnits("1000000", 18));
  });
});