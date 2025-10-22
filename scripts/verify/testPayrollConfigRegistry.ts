import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Replace with your deployed contract address
const REGISTRY_ADDRESS = process.env.PAYROLL_CONFIG_REGISTRY_ADDRESS || "";

async function main() {
  if (!REGISTRY_ADDRESS) {
    console.error("❌ Please set PAYROLL_CONFIG_REGISTRY_ADDRESS in .env");
    process.exit(1);
  }

  const network = process.env.HARDHAT_NETWORK || "arbitrumSepolia";
  console.log(`\n🧪 Testing PayrollConfigRegistry on ${network}...`);
  console.log(`📍 Contract Address: ${REGISTRY_ADDRESS}`);

  const [signer] = await ethers.getSigners();
  console.log(`👤 Signer: ${signer.address}`);

  // Get contract instance
  const PayrollConfigRegistry = await ethers.getContractAt(
    "PayrollConfigRegistry",
    REGISTRY_ADDRESS
  );

  console.log("\n📊 Initial State:");
  const nextConfigId = await PayrollConfigRegistry.nextConfigId();
  console.log(`   Next Config ID: ${nextConfigId}`);

  const userConfigCount = await PayrollConfigRegistry.getUserConfigCount(
    signer.address
  );
  console.log(`   User Config Count: ${userConfigCount}`);

  const publicConfigCount = await PayrollConfigRegistry.getPublicConfigCount();
  console.log(`   Public Config Count: ${publicConfigCount}`);

  // Test: Save a new configuration
  console.log("\n💾 Test 1: Save a new configuration");

  const testWalletGroups = [
    {
      wallet: "0xC94d68094FA65E991dFfa0A941306E8460876169",
      walletAmount: ethers.parseUnits("100", 6), // 100 USDC
      strategies: [
        { strategy: 0, subPercent: 6000 }, // DIRECT_TRANSFER 60%
        { strategy: 1, subPercent: 3000 }, // AAVE_SUPPLY 30%
        { strategy: 2, subPercent: 1000 }, // MORPHO_DEPOSIT 10%
        { strategy: 3, subPercent: 0 }, // UNISWAP_V2_SWAP 0%
      ],
    },
    {
      wallet: "0x08D811A358850892029251CcC8a565a32fd2dCB8",
      walletAmount: ethers.parseUnits("50", 6), // 50 USDC
      strategies: [
        { strategy: 0, subPercent: 5000 }, // DIRECT_TRANSFER 50%
        { strategy: 1, subPercent: 5000 }, // AAVE_SUPPLY 50%
        { strategy: 2, subPercent: 0 }, // MORPHO_DEPOSIT 0%
        { strategy: 3, subPercent: 0 }, // UNISWAP_V2_SWAP 0%
      ],
    },
  ];

  const testSchedule = {
    enabled: true,
    intervalMinutes: 60,
    maxExecutions: 3,
  };

  console.log("   Saving config...");
  const tx = await PayrollConfigRegistry.saveConfig(
    "Test Payroll Config",
    "Monthly salary distribution with DeFi strategies",
    testWalletGroups,
    testSchedule,
    true // isPublic
  );

  const receipt = await tx.wait();
  console.log(`   ✅ Config saved! Tx: ${receipt.hash}`);

  // Get the config ID from the event
  const event = receipt.logs
    .map((log: any) => {
      try {
        return PayrollConfigRegistry.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e: any) => e && e.name === "ConfigSaved");

  const configId = event?.args?.configId;
  console.log(`   📝 Config ID: ${configId}`);

  // Test: Load the configuration
  console.log("\n📖 Test 2: Load the configuration");
  const config = await PayrollConfigRegistry.getConfig(configId);
  console.log(`   ID: ${config.id}`);
  console.log(`   Owner: ${config.owner}`);
  console.log(`   Name: ${config.name}`);
  console.log(`   Description: ${config.description}`);
  console.log(`   Wallet Groups: ${config.walletGroupCount}`);
  console.log(`   Schedule Enabled: ${config.schedule.enabled}`);
  console.log(`   Interval Minutes: ${config.schedule.intervalMinutes}`);
  console.log(`   Max Executions: ${config.schedule.maxExecutions}`);
  console.log(`   Is Public: ${config.isPublic}`);

  // Test: Get wallet group details
  console.log("\n👛 Test 3: Get wallet group details");
  for (let i = 0; i < Number(config.walletGroupCount); i++) {
    const group = await PayrollConfigRegistry.getWalletGroup(configId, i);
    console.log(`   Group ${i + 1}:`);
    console.log(`     Wallet: ${group.wallet}`);
    console.log(
      `     Amount: ${ethers.formatUnits(group.walletAmount, 6)} USDC`
    );
    console.log(`     Strategies: ${group.strategyCount}`);

    for (let j = 0; j < Number(group.strategyCount); j++) {
      const strategy = await PayrollConfigRegistry.getStrategyAllocation(
        configId,
        i,
        j
      );
      const strategyNames = [
        "DIRECT_TRANSFER",
        "AAVE_SUPPLY",
        "MORPHO_DEPOSIT",
        "UNISWAP_V2_SWAP",
      ];
      console.log(
        `       ${strategyNames[strategy.strategy]}: ${strategy.subPercent / 100}%`
      );
    }
  }

  // Test: Get user configs
  console.log("\n📋 Test 4: Get user configs");
  const userConfigIds = await PayrollConfigRegistry.getUserConfigIds(
    signer.address
  );
  console.log(`   User has ${userConfigIds.length} config(s)`);
  userConfigIds.forEach((id: bigint, index: number) => {
    console.log(`     ${index + 1}. Config ID: ${id}`);
  });

  // Test: Get public configs
  console.log("\n🌐 Test 5: Get public configs");
  const publicConfigIds = await PayrollConfigRegistry.getPublicConfigIds();
  console.log(`   ${publicConfigIds.length} public config(s) available`);
  publicConfigIds.forEach((id: bigint, index: number) => {
    console.log(`     ${index + 1}. Config ID: ${id}`);
  });

  // Test: Update configuration
  console.log("\n✏️  Test 6: Update configuration");
  const updatedWalletGroups = [
    {
      wallet: "0xC94d68094FA65E991dFfa0A941306E8460876169",
      walletAmount: ethers.parseUnits("150", 6), // Updated to 150 USDC
      strategies: [
        { strategy: 0, subPercent: 7000 }, // Updated to 70%
        { strategy: 1, subPercent: 2000 }, // Updated to 20%
        { strategy: 2, subPercent: 1000 }, // 10%
        { strategy: 3, subPercent: 0 }, // 0%
      ],
    },
  ];

  const updatedSchedule = {
    enabled: false,
    intervalMinutes: 0,
    maxExecutions: 0,
  };

  console.log("   Updating config...");
  const updateTx = await PayrollConfigRegistry.updateConfig(
    configId,
    "Updated Test Payroll Config",
    "Updated description",
    updatedWalletGroups,
    updatedSchedule
  );

  await updateTx.wait();
  console.log(`   ✅ Config updated!`);

  const updatedConfig = await PayrollConfigRegistry.getConfig(configId);
  console.log(`   New Name: ${updatedConfig.name}`);
  console.log(`   New Wallet Groups: ${updatedConfig.walletGroupCount}`);
  console.log(`   Schedule Enabled: ${updatedConfig.schedule.enabled}`);

  // Test: Toggle public visibility
  console.log("\n🔒 Test 7: Toggle public visibility");
  console.log(`   Current visibility: ${updatedConfig.isPublic ? "Public" : "Private"}`);
  
  const toggleTx = await PayrollConfigRegistry.togglePublic(configId);
  await toggleTx.wait();
  console.log(`   ✅ Visibility toggled!`);

  const finalConfig = await PayrollConfigRegistry.getConfig(configId);
  console.log(`   New visibility: ${finalConfig.isPublic ? "Public" : "Private"}`);

  console.log("\n✨ All tests completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
