import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Contract address (deployed on Arbitrum Sepolia)
const RECURRING_SPLITTER_ADDRESS = "0x6E5cb8981a716a472Fa6967608714Ab1a9Aae0E9";

// Arbitrum Sepolia addresses
const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

// DeFi Strategy enum
enum DeFiStrategy {
  DIRECT_TRANSFER = 0,
  AAVE_SUPPLY = 1,
  MORPHO_DEPOSIT = 2,
}

async function main() {
  const scheduleId = process.argv[2] || "0";
  
  const [signer] = await ethers.getSigners();
  console.log("Executing schedule with account:", signer.address);

  // Get contract instance
  const contract = await ethers.getContractAt(
    "RecurringSplitter",
    RECURRING_SPLITTER_ADDRESS
  );

  console.log(`\n📅 Executing Schedule ID: ${scheduleId}`);

  // Get schedule details before execution
  const scheduleInfoBefore = await contract.getSchedule(scheduleId);
  console.log("\n📊 Before Execution:");
  console.log("  Execution count:", scheduleInfoBefore[5].toString());
  console.log("  Next execution:", new Date(Number(scheduleInfoBefore[4]) * 1000).toLocaleString());
  console.log("  Active:", scheduleInfoBefore[7] ? "✅ Yes" : "❌ No");

  // Check if ready to execute
  const now = Math.floor(Date.now() / 1000);
  const nextExecution = Number(scheduleInfoBefore[4]);
  
  if (now < nextExecution) {
    console.log(`\n⚠️  Too early! Wait ${nextExecution - now} more seconds.`);
    return;
  }

  if (!scheduleInfoBefore[7]) {
    console.log("\n❌ Schedule is not active!");
    return;
  }

  // Execute schedule
  console.log("\n⏳ Executing schedule...");
  const tx = await contract.executeSchedule(scheduleId);
  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Execution completed!");
  console.log("Gas used:", receipt?.gasUsed.toString());

  // Parse events
  if (receipt?.logs) {
    console.log("\n💸 Distribution Events:");
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });

        if (parsed?.name === "RecipientPaid") {
          const [schedId, recipient, amount, strategy] = parsed.args;
          let strategyName;
          if (strategy === 0) {
            strategyName = "Direct Transfer";
          } else if (strategy === 1) {
            strategyName = "AAVE Supply";
          } else if (strategy === 2) {
            strategyName = "Morpho Deposit";
          } else {
            strategyName = "Unknown";
          }
          console.log(
            `  💸 Paid ${ethers.formatUnits(amount, 6)} USDC to ${recipient.slice(0, 6)}...${recipient.slice(-4)} via ${strategyName}`
          );
        }

        if (parsed?.name === "ScheduleExecuted") {
          const [schedId, executionCount, totalAmount] = parsed.args;
          console.log(`\n✅ Schedule executed! Execution #${executionCount.toString()}`);
          console.log(`   Total distributed: ${ethers.formatUnits(totalAmount, 6)} USDC`);
        }

        if (parsed?.name === "ScheduleCancelled") {
          console.log("\n🛑 Schedule has been cancelled (max executions reached)");
        }
      } catch (e) {
        // Skip non-contract logs
      }
    }
  }

  // Get schedule details after execution
  const scheduleInfoAfter = await contract.getSchedule(scheduleId);
  console.log("\n📊 After Execution:");
  console.log("  Execution count:", scheduleInfoAfter[5].toString());
  console.log("  Next execution:", new Date(Number(scheduleInfoAfter[4]) * 1000).toLocaleString());
  console.log("  Active:", scheduleInfoAfter[7] ? "✅ Yes" : "❌ No");
  console.log("  Max executions:", scheduleInfoAfter[6].toString());

  const remainingExecutions = Number(scheduleInfoAfter[6]) - Number(scheduleInfoAfter[5]);
  if (remainingExecutions > 0 && scheduleInfoAfter[7]) {
    console.log(`\n💡 ${remainingExecutions} execution(s) remaining`);
    console.log(`   Next execution in ${scheduleInfoAfter[3].toString()} seconds`);
  } else if (!scheduleInfoAfter[7]) {
    console.log("\n🎉 Schedule completed! All executions finished.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
