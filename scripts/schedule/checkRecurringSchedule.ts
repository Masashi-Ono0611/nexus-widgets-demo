import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Contract address (deployed on Arbitrum Sepolia)
const RECURRING_SPLITTER_ADDRESS = "0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E";

// Arbitrum Sepolia addresses
const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

async function main() {
  const scheduleId = process.argv[2] || "0";
  
  const [signer] = await ethers.getSigners();
  console.log("Checking schedule with account:", signer.address);

  // Get contract instance
  const contract = await ethers.getContractAt(
    "RecurringSplitter",
    RECURRING_SPLITTER_ADDRESS
  );

  console.log("\n📋 Contract Information");
  console.log("Contract Address:", RECURRING_SPLITTER_ADDRESS);
  
  // Check contract ETH balance
  const contractBalance = await ethers.provider.getBalance(RECURRING_SPLITTER_ADDRESS);
  console.log("Contract ETH Balance:", ethers.formatEther(contractBalance), "ETH");

  // Get schedule details
  console.log(`\n📅 Schedule ID: ${scheduleId}`);
  const scheduleInfo = await contract.getSchedule(scheduleId);
  
  console.log("\n📊 Schedule Details:");
  console.log("  Owner:", scheduleInfo[0]);
  console.log("  Asset:", scheduleInfo[1]);
  console.log("  Amount per execution:", ethers.formatUnits(scheduleInfo[2], 6), "USDC");
  console.log("  Interval:", scheduleInfo[3].toString(), "seconds");
  
  const nextExecution = Number(scheduleInfo[4]);
  const now = Math.floor(Date.now() / 1000);
  const timeUntilNext = nextExecution - now;
  
  console.log("  Next execution:", new Date(nextExecution * 1000).toLocaleString());
  if (timeUntilNext > 0) {
    console.log(`  Time until next: ${timeUntilNext} seconds`);
  } else {
    console.log(`  ⏰ Ready to execute! (${Math.abs(timeUntilNext)} seconds overdue)`);
  }
  
  console.log("  Execution count:", scheduleInfo[5].toString());
  console.log("  Max executions:", scheduleInfo[6].toString());
  console.log("  Active:", scheduleInfo[7] ? "✅ Yes" : "❌ No");
  console.log("  Recipients:", scheduleInfo[8].toString());

  // Check Gelato task status
  const isTaskCreated = await contract.isGelatoTaskCreated();
  if (isTaskCreated) {
    const taskId = await contract.gelatoTaskId();
    console.log("\n🤖 Gelato Task:");
    console.log("  Task ID:", taskId);
    console.log("  Status: Active");
  }

  // Check if ready to execute
  const checkerResult = await contract.checker();
  console.log("\n🔍 Checker Status:");
  console.log("  Can Execute:", checkerResult[0] ? "✅ Yes" : "❌ No");
  if (checkerResult[0]) {
    console.log("  Gelato will execute soon!");
  }

  // Get USDC contract
  const usdc = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    USDC_ADDRESS
  );

  // Check owner's USDC balance and allowance
  const ownerBalance = await usdc.balanceOf(scheduleInfo[0]);
  const allowance = await usdc.allowance(scheduleInfo[0], RECURRING_SPLITTER_ADDRESS);
  
  console.log("\n💰 Owner Status:");
  console.log("  USDC Balance:", ethers.formatUnits(ownerBalance, 6), "USDC");
  console.log("  Allowance:", ethers.formatUnits(allowance, 6), "USDC");
  
  const remainingExecutions = Number(scheduleInfo[6]) - Number(scheduleInfo[5]);
  const neededAmount = scheduleInfo[2] * BigInt(remainingExecutions);
  console.log("  Remaining executions:", remainingExecutions);
  console.log("  USDC needed:", ethers.formatUnits(neededAmount, 6), "USDC");
  
  if (allowance < neededAmount) {
    console.log("  ⚠️  Insufficient allowance for remaining executions!");
  } else {
    console.log("  ✅ Sufficient allowance");
  }

  console.log("\n💡 To manually execute (if needed):");
  console.log(`  pnpm run execute:recurring-schedule ${scheduleId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
