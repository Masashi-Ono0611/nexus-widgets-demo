import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Contract address (deployed on Arbitrum Sepolia)
const RECURRING_SPLITTER_ADDRESS = "0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E";

// Arbitrum Sepolia addresses
const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

// DeFi Strategy enum
enum DeFiStrategy {
  DIRECT_TRANSFER = 0,
  AAVE_SUPPLY = 1,
  MORPHO_DEPOSIT = 2,
  UNISWAP_V2_SWAP = 3,
}

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing with account:", signer.address);

  // Get contract instance
  const contract = await ethers.getContractAt(
    "RecurringSplitter",
    RECURRING_SPLITTER_ADDRESS
  );

  console.log("\n📋 Contract Information");
  console.log("Contract Address:", RECURRING_SPLITTER_ADDRESS);
  console.log("AAVE Pool:", await contract.aavePool());
  console.log("Morpho Vault:", await contract.morphoVault());
  console.log("Gelato Automate:", await contract.GELATO_AUTOMATE());
  console.log("Gelato Task Created:", await contract.isGelatoTaskCreated());

  // Get USDC contract
  const usdc = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    USDC_ADDRESS
  );

  // Check USDC balance
  const balance = await usdc.balanceOf(signer.address);
  console.log("\n💰 USDC Balance:", ethers.formatUnits(balance, 6), "USDC");

  if (balance === 0n) {
    console.log("\n⚠️  No USDC balance. Get testnet USDC from:");
    console.log("https://faucet.circle.com/");
    return;
  }

  // Example recipients configuration - Testing all 4 strategies
  const recipients = [
    {
      wallet: "0xC94d68094FA65E991dFfa0A941306E8460876169",
      sharePercent: 4000, // 40% in basis points
      strategy: DeFiStrategy.MORPHO_DEPOSIT,
    },
    {
      wallet: "0x08D811A358850892029251CcC8a565a32fd2dCB8",
      sharePercent: 3000, // 30%
      strategy: DeFiStrategy.AAVE_SUPPLY,
    },
    {
      wallet: signer.address,
      sharePercent: 2000, // 20%
      strategy: DeFiStrategy.DIRECT_TRANSFER,
    },
    {
      wallet: signer.address,
      sharePercent: 1000, // 10%
      strategy: DeFiStrategy.UNISWAP_V2_SWAP,
    },
  ];

  const amountPerExecution = ethers.parseUnits("1", 6); // 1 USDC per execution
  const intervalSeconds = 60; // 1 minute
  const maxExecutions = 3; // Execute 3 times then stop

  console.log("\n📊 Schedule Configuration");
  console.log("Amount per execution:", ethers.formatUnits(amountPerExecution, 6), "USDC");
  console.log("Interval:", intervalSeconds, "seconds (1 minute)");
  console.log("Max executions:", maxExecutions);
  console.log("\nRecipients:");
  recipients.forEach((r, i) => {
    const recipientAmount = (amountPerExecution * BigInt(r.sharePercent)) / 10000n;
    const strategyName =
      r.strategy === DeFiStrategy.DIRECT_TRANSFER
        ? "Direct Transfer"
        : r.strategy === DeFiStrategy.AAVE_SUPPLY
          ? "AAVE Supply"
          : r.strategy === DeFiStrategy.MORPHO_DEPOSIT
            ? "Morpho Deposit"
            : "Uniswap V2 Swap";
    console.log(
      `  ${i + 1}. ${r.wallet.slice(0, 6)}...${r.wallet.slice(-4)}: ${ethers.formatUnits(recipientAmount, 6)} USDC (${r.sharePercent / 100}%) - ${strategyName}`
    );
  });

  // Check allowance
  const allowance = await usdc.allowance(signer.address, RECURRING_SPLITTER_ADDRESS);
  console.log("\n🔐 Current Allowance:", ethers.formatUnits(allowance, 6), "USDC");

  const totalNeeded = amountPerExecution * BigInt(maxExecutions);
  if (allowance < totalNeeded) {
    console.log(`\n⏳ Approving ${ethers.formatUnits(totalNeeded, 6)} USDC for ${maxExecutions} executions...`);
    const approveTx = await usdc.approve(RECURRING_SPLITTER_ADDRESS, totalNeeded);
    await approveTx.wait();
    console.log("✅ Approved");
  }

  // Create schedule
  console.log("\n⏳ Creating recurring schedule...");
  const tx = await contract.createSchedule(
    USDC_ADDRESS,
    amountPerExecution,
    recipients,
    intervalSeconds,
    maxExecutions
  );
  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Schedule created!");
  console.log("Gas used:", receipt?.gasUsed.toString());

  // Get schedule ID from event
  let scheduleId;
  if (receipt?.logs) {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });

        if (parsed?.name === "ScheduleCreated") {
          scheduleId = parsed.args[0];
          console.log("\n📅 Schedule ID:", scheduleId.toString());
          break;
        }
      } catch (e) {
        // Skip non-contract logs
      }
    }
  }

  if (scheduleId !== undefined) {
    // Get schedule details
    const scheduleInfo = await contract.getSchedule(scheduleId);
    console.log("\n📋 Schedule Details:");
    console.log("  Owner:", scheduleInfo[0]);
    console.log("  Asset:", scheduleInfo[1]);
    console.log("  Amount per execution:", ethers.formatUnits(scheduleInfo[2], 6), "USDC");
    console.log("  Interval:", scheduleInfo[3].toString(), "seconds");
    console.log("  Next execution:", new Date(Number(scheduleInfo[4]) * 1000).toLocaleString());
    console.log("  Execution count:", scheduleInfo[5].toString());
    console.log("  Max executions:", scheduleInfo[6].toString());
    console.log("  Active:", scheduleInfo[7]);
    console.log("  Recipients:", scheduleInfo[8].toString());

    // Check if Gelato task was created
    const isTaskCreated = await contract.isGelatoTaskCreated();
    if (isTaskCreated) {
      const taskId = await contract.gelatoTaskId();
      console.log("\n🤖 Gelato Task:");
      console.log("  Task ID:", taskId);
      console.log("  Status: Active");
      console.log("  Will execute automatically when time comes");
    }

    console.log("\n💡 Next Steps:");
    console.log("1. Wait 1 minute for the first execution");
    console.log("2. Gelato will automatically execute the schedule");
    console.log("3. Check recipient balances after each execution");
    console.log(`4. Schedule will run ${maxExecutions} times total`);
    console.log("\n⚠️  Make sure the contract has ETH for Gelato fees!");
    console.log(`   Send some ETH to: ${RECURRING_SPLITTER_ADDRESS}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
