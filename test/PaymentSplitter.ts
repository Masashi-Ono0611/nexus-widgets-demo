import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const TOKEN_DECIMALS = 6;
const SHARES = [70n, 20n, 10n];

async function deployPaymentSplitterFixture() {
  const [owner, recipientB, recipientC, recipientD, other] = await ethers.getSigners();

  const initialSupply = ethers.parseUnits("1000", TOKEN_DECIMALS);
  const token = (await ethers.deployContract("MockUSDC", [initialSupply, TOKEN_DECIMALS])) as any;
  await token.waitForDeployment();

  const recipients = [recipientB.address, recipientC.address, recipientD.address];
  const paymentSplitter = (await ethers.deployContract("PaymentSplitter", [recipients, SHARES, owner.address])) as any;
  await paymentSplitter.waitForDeployment();

  return {
    owner,
    recipientB,
    recipientC,
    recipientD,
    other,
    token,
    paymentSplitter,
  };
}

describe("PaymentSplitter", function () {
  it("distributes funds according to shares", async function () {
    const { owner, recipientB, recipientC, recipientD, token, paymentSplitter } =
      await loadFixture(deployPaymentSplitterFixture);

    const amount = ethers.parseUnits("100", TOKEN_DECIMALS);
    await token.connect(owner).approve(await paymentSplitter.getAddress(), amount);

    await expect(
      paymentSplitter.connect(owner).distribute(await token.getAddress(), amount)
    )
      .to.emit(paymentSplitter, "Distribution")
      .withArgs(await token.getAddress(), amount);

    expect(await token.balanceOf(recipientB.address)).to.equal(
      ethers.parseUnits("70", TOKEN_DECIMALS)
    );
    expect(await token.balanceOf(recipientC.address)).to.equal(
      ethers.parseUnits("20", TOKEN_DECIMALS)
    );
    expect(await token.balanceOf(recipientD.address)).to.equal(
      ethers.parseUnits("10", TOKEN_DECIMALS)
    );
  });

  it("rounds remainder to last recipient", async function () {
    const { owner, recipientB, recipientC, recipientD, token, paymentSplitter } =
      await loadFixture(deployPaymentSplitterFixture);

    const amount = ethers.parseUnits("100", TOKEN_DECIMALS) + 1n;
    await token.connect(owner).approve(await paymentSplitter.getAddress(), amount);

    await paymentSplitter.connect(owner).distribute(await token.getAddress(), amount);

    const expectedB = (amount * SHARES[0]) / 100n;
    const expectedC = (amount * SHARES[1]) / 100n;
    const expectedD = amount - expectedB - expectedC;

    expect(await token.balanceOf(recipientB.address)).to.equal(expectedB);
    expect(await token.balanceOf(recipientC.address)).to.equal(expectedC);
    expect(await token.balanceOf(recipientD.address)).to.equal(expectedD);
  });

  it("allows any caller with sufficient approval", async function () {
    const { owner, other, recipientB, recipientC, recipientD, token, paymentSplitter } =
      await loadFixture(deployPaymentSplitterFixture);

    const amount = ethers.parseUnits("10", TOKEN_DECIMALS);
    await token.connect(owner).transfer(other.address, amount);
    await token.connect(other).approve(await paymentSplitter.getAddress(), amount);

    await paymentSplitter.connect(other).distribute(await token.getAddress(), amount);

    expect(await token.balanceOf(recipientB.address)).to.equal(
      ethers.parseUnits("7", TOKEN_DECIMALS)
    );
    expect(await token.balanceOf(recipientC.address)).to.equal(
      ethers.parseUnits("2", TOKEN_DECIMALS)
    );
    expect(await token.balanceOf(recipientD.address)).to.equal(
      ethers.parseUnits("1", TOKEN_DECIMALS)
    );
  });

  it("reverts when insufficient allowance", async function () {
    const { owner, token, paymentSplitter } = await loadFixture(deployPaymentSplitterFixture);

    const amount = ethers.parseUnits("1", TOKEN_DECIMALS);
    await expect(
      paymentSplitter.connect(owner).distribute(await token.getAddress(), amount)
    ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
  });
});
