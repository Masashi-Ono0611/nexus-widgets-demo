import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const DELAYED_TRANSFER_ADDRESS = "0x9B31E6D589657d37fFf3d8D8f3699C8d28c4B8F9";
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

// Base Sepolia USDC (Circle)
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const DELAYED_TRANSFER_ABI = [
  "function scheduleTransfer(address asset, uint256 amount, address recipient, uint256 delaySeconds) external returns (uint256 transferId)",
  "function executeTransfer(uint256 transferId) external",
  "function checker() external view returns (bool canExec, bytes memory execPayload)",
  "function getTransfer(uint256 transferId) external view returns (address asset, uint256 amount, address recipient, uint256 executeAfter, bool executed)",
  "function getUserTransfers(address user) external view returns (uint256[] memory)",
  "function isTransferReady(uint256 transferId) external view returns (bool)",
  "function nextTransferId() external view returns (uint256)",
  "function isGelatoTaskCreated() external view returns (bool)",
  "function gelatoTaskId() external view returns (bytes32)",
  "event TransferScheduled(uint256 indexed transferId, address indexed user, address indexed asset, uint256 amount, address recipient, uint256 executeAfter)",
  "event GelatoTaskCreated(bytes32 indexed taskId)"
];

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

async function main() {
  console.log("🧪 Testing DelayedTransfer Contract\n");
  console.log("Contract Address:", DELAYED_TRANSFER_ADDRESS);
  console.log("Network: Base Sepolia\n");

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const privateKey = process.env.BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY not found in .env");
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Wallet Address:", wallet.address);
  
  // Get ETH balance
  const ethBalance = await provider.getBalance(wallet.address);
  console.log("ETH Balance:", ethers.formatEther(ethBalance), "ETH\n");

  // Connect to contracts
  const delayedTransfer = new ethers.Contract(
    DELAYED_TRANSFER_ADDRESS,
    DELAYED_TRANSFER_ABI,
    wallet
  );
  
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet);

  // Check USDC balance
  let usdcBalance = 0n;
  let decimals = 6;
  
  try {
    usdcBalance = await usdc.balanceOf(wallet.address);
    decimals = await usdc.decimals();
    console.log("USDC Balance:", ethers.formatUnits(usdcBalance, decimals), "USDC");
    
    if (usdcBalance === 0n) {
      console.log("⚠️  Warning: USDC balance is 0. You need USDC to test.");
    }
  } catch (error: any) {
    console.log("⚠️  Could not fetch USDC balance (RPC issue)");
    console.log("Assuming decimals = 6");
  }

  // Check current state
  console.log("\n📊 Current Contract State:");
  
  let nextId = 0n;
  let isTaskCreated = false;
  let userTransfers: bigint[] = [];
  
  try {
    nextId = await delayedTransfer.nextTransferId();
    console.log("Next Transfer ID:", nextId.toString());
    
    isTaskCreated = await delayedTransfer.isGelatoTaskCreated();
    console.log("Gelato Task Created:", isTaskCreated);
    
    if (isTaskCreated) {
      const taskId = await delayedTransfer.gelatoTaskId();
      console.log("Gelato Task ID:", taskId);
    }

    // Get user's existing transfers
    userTransfers = await delayedTransfer.getUserTransfers(wallet.address);
    console.log("User's Transfer Count:", userTransfers.length);
  } catch (error: any) {
    console.log("⚠️  Could not fetch contract state (RPC issue)");
    console.log("Error:", error.message);
  }
  
  if (userTransfers.length > 0) {
    console.log("\n📋 Existing Transfers:");
    for (let i = 0; i < userTransfers.length; i++) {
      const transferId = userTransfers[i];
      const transfer = await delayedTransfer.getTransfer(transferId);
      const isReady = await delayedTransfer.isTransferReady(transferId);
      
      console.log(`\nTransfer ID ${transferId}:`);
      console.log("  Asset:", transfer[0]);
      console.log("  Amount:", ethers.formatUnits(transfer[1], decimals), "USDC");
      console.log("  Recipient:", transfer[2]);
      console.log("  Execute After:", new Date(Number(transfer[3]) * 1000).toLocaleString());
      console.log("  Executed:", transfer[4]);
      console.log("  Ready to Execute:", isReady);
    }
  }

  // Check checker function
  console.log("\n🔍 Checking Resolver (checker function):");
  try {
    const [canExec, execPayload] = await delayedTransfer.checker();
    console.log("Can Execute:", canExec);
    if (canExec) {
      console.log("Exec Payload:", execPayload);
    } else {
      console.log("Reason:", ethers.toUtf8String(execPayload));
    }
  } catch (error: any) {
    console.log("Checker result:", error.message);
  }

  // Interactive menu
  console.log("\n\n🎯 Available Actions:");
  console.log("1. Schedule a new transfer (1 minute delay for testing)");
  console.log("2. Schedule a new transfer (24 hours delay)");
  console.log("3. Execute a ready transfer");
  console.log("4. Schedule a new transfer (3 minutes delay)");
  console.log("5. Exit");
  
  const action = process.argv[2] || "5";
  
  if (action === "1" || action === "2" || action === "4") {
    const delaySeconds = action === "1" ? 60 : action === "2" ? 86400 : 180; // 1 minute, 24 hours, or 3 minutes
    const amount = ethers.parseUnits("0.1", decimals); // 0.1 USDC
    const recipient = "0xC94d68094FA65E991dFfa0A941306E8460876169"; // Test recipient
    
    console.log(`\n📤 Scheduling Transfer:`);
    console.log("Amount:", ethers.formatUnits(amount, decimals), "USDC");
    console.log("Recipient:", recipient);
    console.log("Delay:", delaySeconds, "seconds");
    
    // Check and approve USDC
    console.log("\n🔍 Checking USDC allowance...");
    let allowance = 0n;
    
    try {
      allowance = await usdc.allowance(wallet.address, DELAYED_TRANSFER_ADDRESS);
      console.log("Current allowance:", ethers.formatUnits(allowance, decimals), "USDC");
    } catch (error: any) {
      console.log("⚠️  Could not check allowance (RPC issue), will attempt approval anyway");
    }
    
    if (allowance < amount) {
      console.log("\n✍️  Approving USDC...");
      const approveTx = await usdc.approve(DELAYED_TRANSFER_ADDRESS, ethers.MaxUint256);
      console.log("Approval TX:", approveTx.hash);
      console.log("⏳ Waiting for approval confirmation...");
      await approveTx.wait();
      console.log("✅ USDC approved");
      
      // Wait a bit for state to propagate
      console.log("⏳ Waiting 3 seconds for state propagation...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      console.log("✅ USDC already approved");
    }
    
    console.log("\n📝 Calling scheduleTransfer...");
    const tx = await delayedTransfer.scheduleTransfer(
      USDC_ADDRESS,
      amount,
      recipient,
      delaySeconds
    );
    
    console.log("Transaction Hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Gas Used:", receipt.gasUsed.toString());
    
    // Parse events
    const transferScheduledEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = delayedTransfer.interface.parseLog(log);
        return parsed?.name === "TransferScheduled";
      } catch {
        return false;
      }
    });
    
    if (transferScheduledEvent) {
      const parsed = delayedTransfer.interface.parseLog(transferScheduledEvent);
      console.log("\n🎉 Transfer Scheduled!");
      console.log("Transfer ID:", parsed?.args[0].toString());
    }
    
    const gelatoTaskEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = delayedTransfer.interface.parseLog(log);
        return parsed?.name === "GelatoTaskCreated";
      } catch {
        return false;
      }
    });
    
    if (gelatoTaskEvent) {
      const parsed = delayedTransfer.interface.parseLog(gelatoTaskEvent);
      console.log("\n🤖 Gelato Task Created!");
      console.log("Task ID:", parsed?.args[0]);
    }
    
  } else if (action === "3") {
    const transferId = process.argv[3] || "0";
    console.log(`\n⚡ Executing Transfer ID: ${transferId}`);
    
    const tx = await delayedTransfer.executeTransfer(transferId);
    console.log("Transaction Hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transfer executed!");
    console.log("Gas Used:", receipt.gasUsed.toString());
  }
  
  console.log("\n✅ Test completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

/**
 * Usage Examples:
 * 
 * # Check contract state
 * pnpm run test:delayed-transfer
 * 
 * # Schedule a transfer (1 minute delay)
 * pnpm run test:delayed-transfer 1
 * 
 * # Schedule a transfer (24 hours delay)
 * pnpm run test:delayed-transfer 2
 * 
 * # Manually execute Transfer ID 1
 * pnpm run test:delayed-transfer 3 1
 * 
 * # Schedule a transfer (3 minutes delay)
 * pnpm run test:delayed-transfer 4
 */
