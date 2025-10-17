require("dotenv/config");

const hre = require("hardhat");
const { ethers } = hre;

const AAVE_BASE_SEPOLIA_POOL = "0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27";
const BASE_SEPOLIA_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_DECIMALS = 6;

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
];

const AAVE_POOL_ABI = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
];

const AMOUNT_TO_SUPPLY = "0.1"; // in USDC units, adjust as needed
const REFERRAL_CODE = 0; // keep 0 for standard supply flows

async function main() {
  const [signer] = await ethers.getSigners();
  if (!signer) {
    throw new Error(
      "No signer available. Ensure BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY is set in your .env file."
    );
  }

  const signerAddress = await signer.getAddress();
  console.log(`Using signer: ${signerAddress}`);

  const amountWei = ethers.parseUnits(AMOUNT_TO_SUPPLY, USDC_DECIMALS);
  console.log(`Supplying ${AMOUNT_TO_SUPPLY} USDC (${amountWei} wei)`);

  const usdc = new ethers.Contract(BASE_SEPOLIA_USDC, ERC20_ABI, signer);
  const pool = new ethers.Contract(AAVE_BASE_SEPOLIA_POOL, AAVE_POOL_ABI, signer);

  const balance: bigint = await usdc.balanceOf(signerAddress);
  console.log(`Current USDC balance: ${ethers.formatUnits(balance, USDC_DECIMALS)} USDC`);
  if (balance < amountWei) {
    throw new Error("Insufficient USDC balance for supply amount.");
  }

  const allowance: bigint = await usdc.allowance(signerAddress, AAVE_BASE_SEPOLIA_POOL);
  console.log(`Existing allowance: ${ethers.formatUnits(allowance, USDC_DECIMALS)} USDC`);

  if (allowance < amountWei) {
    console.log("Allowance too low. Sending approve transaction...");
    const approveTx = await usdc.approve(AAVE_BASE_SEPOLIA_POOL, amountWei);
    console.log(`Approve tx hash: ${approveTx.hash}`);
    await approveTx.wait();
    console.log("Approve confirmed.");
  } else {
    console.log("Allowance sufficient. Skipping approve.");
  }

  console.log("Sending supply transaction...");
  const supplyTx = await pool.supply(
    BASE_SEPOLIA_USDC,
    amountWei,
    signerAddress,
    REFERRAL_CODE
  );
  console.log(`Supply tx hash: ${supplyTx.hash}`);
  await supplyTx.wait();
  console.log("Supply confirmed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
