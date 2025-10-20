import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Base Sepolia WETH address
// WETH9 is typically deployed at the same address across chains
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006"; // Base Sepolia WETH

// WETH ABI (minimal - deposit and withdraw functions)
const WETH_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
];

async function main() {
  console.log("🔄 Wrapping ETH to WETH on Base Sepolia");
  console.log("========================================\n");

  // Get signer
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  console.log("Signer address:", signerAddress);

  // Connect to WETH contract
  const weth = new ethers.Contract(WETH_ADDRESS, WETH_ABI, signer);

  // Verify WETH contract
  try {
    const name = await weth.name();
    const symbol = await weth.symbol();
    console.log(`WETH Contract: ${name} (${symbol})`);
    console.log(`WETH Address: ${WETH_ADDRESS}\n`);
  } catch (error) {
    console.error("❌ Failed to verify WETH contract. Address might be incorrect.");
    throw error;
  }

  // Check balances before
  const ethBalanceBefore = await ethers.provider.getBalance(signerAddress);
  const wethBalanceBefore = await weth.balanceOf(signerAddress);

  console.log("📊 Balances Before:");
  console.log(`ETH: ${ethers.formatEther(ethBalanceBefore)} ETH`);
  console.log(`WETH: ${ethers.formatEther(wethBalanceBefore)} WETH\n`);

  // Amount to wrap: 0.01 ETH
  const wrapAmount = ethers.parseEther("0.01");
  console.log(`Wrap Amount: ${ethers.formatEther(wrapAmount)} ETH\n`);

  if (ethBalanceBefore < wrapAmount) {
    throw new Error("Insufficient ETH balance");
  }

  // Wrap ETH to WETH
  console.log("🔄 Wrapping ETH to WETH...");
  const depositTx = await weth.deposit({ value: wrapAmount });
  console.log("Transaction hash:", depositTx.hash);
  console.log(`View on BaseScan: https://sepolia.basescan.org/tx/${depositTx.hash}`);
  
  const receipt = await depositTx.wait();
  console.log("✅ Wrap confirmed in block:", receipt.blockNumber);
  console.log(`Gas used: ${receipt.gasUsed.toString()}\n`);

  // Wait for balance updates
  console.log("⏳ Waiting for balance updates to propagate...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log();

  // Check balances after
  const ethBalanceAfter = await ethers.provider.getBalance(signerAddress);
  const wethBalanceAfter = await weth.balanceOf(signerAddress);

  const ethChange = ethBalanceBefore - ethBalanceAfter;
  const wethChange = wethBalanceAfter - wethBalanceBefore;

  console.log("📊 Balances After:");
  console.log(`ETH: ${ethers.formatEther(ethBalanceAfter)} ETH (change: -${ethers.formatEther(ethChange)})`);
  console.log(`WETH: ${ethers.formatEther(wethBalanceAfter)} WETH (change: +${ethers.formatEther(wethChange)})\n`);

  console.log("✅ ETH wrapped successfully!");
  console.log(`\n💡 You can now use WETH at: ${WETH_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
