import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Contract address (deployed on Arbitrum Sepolia)
const RECURRING_SPLITTER_ADDRESS = "0x6E5cb8981a716a472Fa6967608714Ab1a9Aae0E9";

async function main() {
  const scheduleId = process.argv[2];
  
  if (scheduleId === undefined) {
    console.error("❌ Please provide a schedule ID");
    console.log("Usage: pnpm run cancel:recurring-schedule [scheduleId]");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  console.log("Cancelling schedule with account:", signer.address);

  // Get contract instance
  const contract = await ethers.getContractAt(
    "RecurringSplitter",
    RECURRING_SPLITTER_ADDRESS
  );

  console.log(`\n📅 Cancelling Schedule ID: ${scheduleId}`);

  // Get schedule details before cancellation
  const scheduleInfoBefore = await contract.getSchedule(scheduleId);
  console.log("\n📊 Schedule Details:");
  console.log("  Owner:", scheduleInfoBefore[0]);
  console.log("  Amount per execution:", ethers.formatUnits(scheduleInfoBefore[2], 6), "USDC");
  console.log("  Execution count:", scheduleInfoBefore[5].toString());
  console.log("  Max executions:", scheduleInfoBefore[6].toString());
  console.log("  Active:", scheduleInfoBefore[7] ? "✅ Yes" : "❌ No");

  // Check if already inactive
  if (!scheduleInfoBefore[7]) {
    console.log("\n⚠️  Schedule is already inactive!");
    return;
  }

  // Check if caller is the owner
  if (scheduleInfoBefore[0].toLowerCase() !== signer.address.toLowerCase()) {
    console.log("\n❌ You are not the owner of this schedule!");
    console.log("   Owner:", scheduleInfoBefore[0]);
    console.log("   Your address:", signer.address);
    return;
  }

  // Cancel schedule
  console.log("\n⏳ Cancelling schedule...");
  const tx = await contract.cancelSchedule(scheduleId);
  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Cancellation completed!");
  console.log("Gas used:", receipt?.gasUsed.toString());

  // Parse events
  if (receipt?.logs) {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });

        if (parsed?.name === "ScheduleCancelled") {
          const [schedId, owner] = parsed.args;
          console.log(`\n🛑 Schedule ${schedId.toString()} cancelled by ${owner}`);
        }
      } catch (e) {
        // Skip non-contract logs
      }
    }
  }

  // Get schedule details after cancellation
  const scheduleInfoAfter = await contract.getSchedule(scheduleId);
  console.log("\n📊 After Cancellation:");
  console.log("  Active:", scheduleInfoAfter[7] ? "✅ Yes" : "❌ No");
  console.log("  Execution count:", scheduleInfoAfter[5].toString());
  
  console.log("\n✅ Schedule successfully cancelled!");
  console.log("   No more automatic executions will occur.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
