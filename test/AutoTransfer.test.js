const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AutoTransfer (JS)", function () {
  async function deployAutoTransferFixture() {
    const [owner, other] = await ethers.getSigners();

    const AutoTransfer = await ethers.getContractFactory("AutoTransfer");
    const autoTransfer = await AutoTransfer.deploy();
    await autoTransfer.waitForDeployment();

    const Token = await ethers.getContractFactory("MockERC20");
    const token = await Token.deploy("Mock Token", "MTK");
    await token.waitForDeployment();

    const mintAmount = ethers.parseUnits("1000", 18);
    await token.mint(owner.address, mintAmount);

    const autoTransferAddress = await autoTransfer.getAddress();
    const tokenAddress = await token.getAddress();
    const forwardAddress = await autoTransfer.FORWARD_ADDRESS();

    return { owner, other, autoTransfer, token, tokenAddress, autoTransferAddress, forwardAddress };
  }

  it("forwards tokens to the forward address", async function () {
    const { owner, other, autoTransfer, token, tokenAddress, autoTransferAddress, forwardAddress } =
      await loadFixture(deployAutoTransferFixture);

    const amount = ethers.parseUnits("100", 18);
    await token.connect(owner).approve(autoTransferAddress, amount);

    await expect(autoTransfer.connect(owner).forward(tokenAddress, amount, other.address, 123))
      .to.emit(autoTransfer, "Forwarded")
      .withArgs(tokenAddress, amount, other.address, 123);

    expect(await token.balanceOf(forwardAddress)).to.equal(amount);
    expect(await token.balanceOf(autoTransferAddress)).to.equal(0n);
  });

  it("reverts when asset is zero address", async function () {
    const { autoTransfer, other } = await loadFixture(deployAutoTransferFixture);

    await expect(autoTransfer.forward(ethers.ZeroAddress, 1n, other.address, 0)).to.be.revertedWith(
      "Invalid asset"
    );
  });

  it("reverts when amount is zero", async function () {
    const { autoTransfer, other, tokenAddress } = await loadFixture(deployAutoTransferFixture);

    await expect(autoTransfer.forward(tokenAddress, 0n, other.address, 0)).to.be.revertedWith(
      "Invalid amount"
    );
  });

  it("reverts when onBehalfOf is zero address", async function () {
    const { owner, autoTransfer, token, tokenAddress, autoTransferAddress } =
      await loadFixture(deployAutoTransferFixture);

    await token.connect(owner).approve(autoTransferAddress, 1n);

    await expect(
      autoTransfer.forward(tokenAddress, 1n, ethers.ZeroAddress, 0)
    ).to.be.revertedWith("Invalid onBehalfOf");
  });
});
