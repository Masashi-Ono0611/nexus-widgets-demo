import { ethers } from "hardhat";

const PAIR_ADDRESS = "0x4F7392b66ADB7D09EdAe3C877714c5992Aeb4671";
const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
const WETH_ADDRESS = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";

// Swap amount
const USDC_AMOUNT = ethers.parseUnits("1", 6); // 1 USDC

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=".repeat(60));
  console.log("Testing SwapExecutor Contract");
  console.log("=".repeat(60));
  console.log("Deployer:", deployer.address);
  console.log();

  // Step 1: Deploy SwapExecutor contract
  console.log("Step 1: Deploying SwapExecutor contract...");
  const SwapExecutor = await ethers.getContractFactory("SwapExecutor");
  const swapExecutor = await SwapExecutor.deploy();
  await swapExecutor.waitForDeployment();
  const swapExecutorAddress = await swapExecutor.getAddress();
  console.log("✅ SwapExecutor deployed to:", swapExecutorAddress);
  console.log();

  const erc20Abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)"
  ];
  
  const usdc = new ethers.Contract(USDC_ADDRESS, erc20Abi, deployer);
  const weth = new ethers.Contract(WETH_ADDRESS, erc20Abi, deployer);

  // Check balances before
  console.log("Balances before swap:");
  const usdcBalanceBefore = await usdc.balanceOf(deployer.address);
  const wethBalanceBefore = await weth.balanceOf(deployer.address);
  console.log("  USDC:", ethers.formatUnits(usdcBalanceBefore, 6));
  console.log("  WETH:", ethers.formatUnits(wethBalanceBefore, 18));
  console.log();

  // Step 2: Get expected output amount
  console.log("Step 2: Checking expected output...");
  const expectedOutput = await swapExecutor.getAmountOut(
    PAIR_ADDRESS,
    USDC_ADDRESS,
    USDC_AMOUNT
  );
  console.log("Expected output:", ethers.formatUnits(expectedOutput, 18), "WETH");
  console.log();

  // Step 3: Approve USDC to SwapExecutor
  console.log("Step 3: Approving USDC to SwapExecutor...");
  const approveTx = await usdc.approve(swapExecutorAddress, USDC_AMOUNT);
  await approveTx.wait();
  console.log("✅ USDC approved");
  console.log();

  // Step 4: Execute swap through contract
  console.log("Step 4: Executing swap through contract...");
  const swapTx = await swapExecutor.executeSwap(
    PAIR_ADDRESS,
    USDC_ADDRESS,
    WETH_ADDRESS,
    USDC_AMOUNT,
    deployer.address
  );
  
  const receipt = await swapTx.wait();
  console.log("✅ Swap executed!");
  console.log("Transaction hash:", receipt?.hash);
  
  // Parse event
  const swapEvent = receipt?.logs.find((log: any) => {
    try {
      const parsed = swapExecutor.interface.parseLog(log);
      return parsed?.name === "SwapExecuted";
    } catch {
      return false;
    }
  });
  
  if (swapEvent) {
    const parsed = swapExecutor.interface.parseLog(swapEvent);
    console.log("Event data:");
    console.log("  amountIn:", ethers.formatUnits(parsed?.args.amountIn, 6), "USDC");
    console.log("  amountOut:", ethers.formatUnits(parsed?.args.amountOut, 18), "WETH");
  }
  console.log();

  // Check balances after
  console.log("Balances after swap:");
  const usdcBalanceAfter = await usdc.balanceOf(deployer.address);
  const wethBalanceAfter = await weth.balanceOf(deployer.address);
  console.log("  USDC:", ethers.formatUnits(usdcBalanceAfter, 6));
  console.log("  WETH:", ethers.formatUnits(wethBalanceAfter, 18));
  console.log();

  // Calculate actual amounts
  const usdcSpent = usdcBalanceBefore - usdcBalanceAfter;
  const wethReceived = wethBalanceAfter - wethBalanceBefore;
  
  console.log("=".repeat(60));
  console.log("Swap Summary");
  console.log("=".repeat(60));
  console.log("Contract address:  ", swapExecutorAddress);
  console.log("USDC spent:        ", ethers.formatUnits(usdcSpent, 6), "USDC");
  console.log("WETH received:     ", ethers.formatUnits(wethReceived, 18), "WETH");
  console.log("Effective rate:    ", (Number(ethers.formatUnits(usdcSpent, 6)) / Number(ethers.formatUnits(wethReceived, 18))).toFixed(2), "USDC per WETH");
  console.log("=".repeat(60));
  console.log();
  console.log("✅ Contract-based swap test completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
