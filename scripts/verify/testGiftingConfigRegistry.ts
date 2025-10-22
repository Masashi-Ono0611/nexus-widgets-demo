import hre from "hardhat";

const REGISTRY_ADDRESS = "0x2e14Dc0A48F5d700695fc0c15b35bcf24761756F";

async function main() {
  console.log("Testing GiftingConfigRegistry...");

  const [signer] = await hre.ethers.getSigners();
  console.log(`Using account: ${signer.address}`);

  const GiftingConfigRegistry = await hre.ethers.getContractFactory("GiftingConfigRegistry");
  const registry = GiftingConfigRegistry.attach(REGISTRY_ADDRESS);

  // Test 1: Save a new config
  console.log("\n1. Saving a new config...");
  const recipients = [
    {
      wallet: "0xC94d68094FA65E991dFfa0A941306E8460876169",
      sharePercent: 5000, // 50%
      strategy: 0, // DIRECT_TRANSFER
    },
    {
      wallet: "0x08D811A358850892029251CcC8a565a32fd2dCB8",
      sharePercent: 3000, // 30%
      strategy: 1, // AAVE_SUPPLY
    },
    {
      wallet: "0xC94d68094FA65E991dFfa0A941306E8460876169",
      sharePercent: 2000, // 20%
      strategy: 2, // MORPHO_DEPOSIT
    },
  ];

  const tx = await registry.saveConfig(
    "Test Gifting Config",
    "Test configuration with 3 recipients",
    recipients,
    true // isPublic
  );
  const receipt = await tx.wait();
  console.log(`Config saved! Gas used: ${receipt?.gasUsed.toString()}`);

  // Get config ID from event
  const event = receipt?.logs.find((log: any) => {
    try {
      const parsed = registry.interface.parseLog(log);
      return parsed?.name === "ConfigSaved";
    } catch {
      return false;
    }
  });

  let configId = 0;
  if (event) {
    const parsed = registry.interface.parseLog(event);
    configId = parsed?.args[0];
    console.log(`Config ID: ${configId}`);
  }

  // Test 2: Get config
  console.log("\n2. Getting config...");
  const config = await registry.getConfig(configId);
  console.log(`Config name: ${config.name}`);
  console.log(`Config description: ${config.description}`);
  console.log(`Recipient count: ${config.recipientCount}`);
  console.log(`Is public: ${config.isPublic}`);

  // Test 3: Get recipients
  console.log("\n3. Getting recipients...");
  for (let i = 0; i < Number(config.recipientCount); i++) {
    const recipient = await registry.getRecipient(configId, i);
    console.log(`Recipient ${i}:`);
    console.log(`  Wallet: ${recipient.wallet}`);
    console.log(`  Share: ${recipient.sharePercent / 100}%`);
    console.log(`  Strategy: ${recipient.strategy}`);
  }

  // Test 4: Get public configs
  console.log("\n4. Getting public configs...");
  const publicConfigIds = await registry.getPublicConfigIds();
  console.log(`Public config count: ${publicConfigIds.length}`);
  console.log(`Public config IDs: ${publicConfigIds.join(", ")}`);

  // Test 5: Get user configs
  console.log("\n5. Getting user configs...");
  const userConfigIds = await registry.getUserConfigIds(signer.address);
  console.log(`User config count: ${userConfigIds.length}`);
  console.log(`User config IDs: ${userConfigIds.join(", ")}`);

  console.log("\n✅ All tests completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
