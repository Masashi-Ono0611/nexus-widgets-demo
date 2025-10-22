import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Base Sepolia Uniswap V4 addresses
const POOL_MANAGER = "0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408";
const SWAP_ROUTER = "0x71cD4Ea054F9Cb3D3BF6251A00673303411A7DD9";
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

// Pool configuration - NEW POOL (USDC/WETH)
const POOL_ID = "0x240c90173b78aef1ed3f7486815fd1f31ceeb55ec2c003eaea88f39dfbcf1cc6";
const FEE = 3000; // 0.3%
const TICK_SPACING = 1; // Most precise
const HOOK_ADDRESS = ethers.ZeroAddress; // No hook

// Swap Router ABI (minimal required functions)
const SWAP_ROUTER_ABI = [
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, bool zeroForOne, tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, bytes hookData, address receiver, uint256 deadline) external returns (uint256 amountOut)",
];

// ERC20 ABI (minimal)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

// PoolManager ABI (minimal - for checking internal balances)
const POOL_MANAGER_ABI = [
  "function currencyDelta(address account, address currency) external view returns (int256)",
];

async function main() {
  console.log("🔄 Starting Uniswap V4 Swap Test on Base Sepolia");
  console.log("================================================\n");

  // Get signer
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  console.log("Signer address:", signerAddress);

  // Connect to contracts
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
  const weth = new ethers.Contract(WETH_ADDRESS, ERC20_ABI, signer);
  const swapRouter = new ethers.Contract(SWAP_ROUTER, SWAP_ROUTER_ABI, signer);

  // Check USDC balance
  const usdcBalance = await usdc.balanceOf(signerAddress);
  console.log(`USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);

  // Check WETH balance
  const wethBalance = await weth.balanceOf(signerAddress);
  console.log(`WETH Balance: ${ethers.formatEther(wethBalance)} WETH`);

  // Check ETH balance
  const ethBalance = await ethers.provider.getBalance(signerAddress);
  console.log(`ETH Balance: ${ethers.formatEther(ethBalance)} ETH\n`);

  // Swap amount: 0.1 USDC
  const swapAmount = ethers.parseUnits("0.1", 6);
  console.log(`Swap Amount: ${ethers.formatUnits(swapAmount, 6)} USDC\n`);

  if (usdcBalance < swapAmount) {
    throw new Error("Insufficient USDC balance");
  }

  // Step 1: Approve SwapRouter to spend USDC
  console.log("📝 Step 1: Approving SwapRouter to spend USDC...");
  const approveTx = await usdc.approve(SWAP_ROUTER, swapAmount);
  await approveTx.wait();
  console.log("✅ Approval confirmed\n");

  // Step 2: Prepare pool key
  // Note: In Uniswap V4, currency0 < currency1 by address
  // USDC (0x036C...) < WETH (0x4200...)
  const currency0 = USDC_ADDRESS;
  const currency1 = WETH_ADDRESS;
  
  const poolKey = {
    currency0: currency0,
    currency1: currency1,
    fee: FEE,
    tickSpacing: TICK_SPACING,
    hooks: HOOK_ADDRESS,
  };

  console.log("Pool Key:");
  console.log("  currency0 (USDC):", poolKey.currency0);
  console.log("  currency1 (WETH):", poolKey.currency1);
  console.log("  fee:", poolKey.fee);
  console.log("  tickSpacing:", poolKey.tickSpacing);
  console.log("  hooks:", poolKey.hooks);
  console.log("  Pool ID:", POOL_ID);
  console.log();

  // Step 3: Execute swap
  // zeroForOne = true means swapping token0 (USDC) for token1 (WETH)
  console.log("🔄 Step 2: Executing swap (USDC -> WETH)...");
  
  const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
  const hookData = "0x"; // Empty hook data
  const amountOutMin = 0; // No slippage protection for testing (set proper value in production)
  const zeroForOne = true; // USDC -> WETH

  try {
    const swapTx = await swapRouter.swapExactTokensForTokens(
      swapAmount,
      amountOutMin,
      zeroForOne,
      poolKey,
      hookData,
      signerAddress,
      deadline
    );

    console.log("Transaction hash:", swapTx.hash);
    console.log(`View on BaseScan: https://sepolia.basescan.org/tx/${swapTx.hash}`);
    const receipt = await swapTx.wait();
    console.log("✅ Swap confirmed in block:", receipt.blockNumber);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    // Log transaction receipt details
    console.log("\n📋 Transaction Receipt:");
    console.log(`Status: ${receipt.status === 1 ? "Success" : "Failed"}`);
    console.log(`Logs count: ${receipt.logs.length}`);
    
    // Try to find Transfer events
    const transferTopic = ethers.id("Transfer(address,address,uint256)");
    const transferLogs = receipt.logs.filter(log => log.topics[0] === transferTopic);
    
    if (transferLogs.length > 0) {
      console.log(`\n🔄 Transfer Events (${transferLogs.length}):`);
      transferLogs.forEach((log, i) => {
        const from = ethers.getAddress("0x" + log.topics[1].slice(26));
        const to = ethers.getAddress("0x" + log.topics[2].slice(26));
        const value = BigInt(log.data);
        console.log(`  ${i + 1}. From: ${from}`);
        console.log(`     To: ${to}`);
        console.log(`     Token: ${log.address}`);
        if (log.address.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
          console.log(`     Amount: ${ethers.formatUnits(value, 6)} USDC`);
        } else if (log.address.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
          console.log(`     Amount: ${ethers.formatEther(value)} WETH`);
        } else {
          console.log(`     Amount: ${ethers.formatEther(value)} (raw: ${value.toString()})`);
        }
      });
    }
    console.log();

    // Wait a bit for balance updates to propagate
    console.log("⏳ Waiting for balance updates to propagate...");
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    console.log();

    // Check balances after swap
    const usdcBalanceAfter = await usdc.balanceOf(signerAddress);
    const wethBalanceAfter = await weth.balanceOf(signerAddress);
    const ethBalanceAfter = await ethers.provider.getBalance(signerAddress);

    const usdcChange = usdcBalance - usdcBalanceAfter;
    const wethChange = wethBalanceAfter - wethBalance;
    const ethChange = ethBalanceAfter - ethBalance;

    console.log("📊 Balances After Swap:");
    console.log(`USDC: ${ethers.formatUnits(usdcBalanceAfter, 6)} USDC (change: ${usdcChange > 0n ? "-" : "+"}${ethers.formatUnits(usdcChange > 0n ? usdcChange : -usdcChange, 6)})`);
    console.log(`WETH: ${ethers.formatEther(wethBalanceAfter)} WETH (change: ${wethChange > 0n ? "+" : ""}${ethers.formatEther(wethChange)})`);
    console.log(`ETH: ${ethers.formatEther(ethBalanceAfter)} ETH (change: ${ethChange > 0n ? "+" : ""}${ethers.formatEther(ethChange)} - gas only)`);
    console.log();

    console.log("✅ Swap test completed successfully!");
  } catch (error: any) {
    console.error("❌ Swap failed:");
    console.error(error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
