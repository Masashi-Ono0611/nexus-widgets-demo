import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

const REGISTRY_ADDRESS = "0x2e14Dc0A48F5d700695fc0c15b35bcf24761756F";

async function main() {
  const network = process.env.HARDHAT_NETWORK || "arbitrumSepolia";
  console.log(`\n🧪 Testing GiftingConfigRegistry on ${network}...`);
  console.log(`📍 Contract Address: ${REGISTRY_ADDRESS}`);

  const [signer] = await ethers.getSigners();
  console.log(`👤 Signer: ${signer.address}`);

  const registry = await ethers.getContractAt("GiftingConfigRegistry", REGISTRY_ADDRESS);

  console.log("\n📊 Initial State:");
  const nextConfigId = await registry.nextConfigId();
  console.log(`   Next Config ID: ${nextConfigId}`);

  const userConfigCount = await registry.getUserConfigCount(signer.address);
  console.log(`   User Config Count: ${userConfigCount}`);

  const publicConfigCount = await registry.getPublicConfigCount();
  console.log(`   Public Config Count: ${publicConfigCount}`);

  console.log("\n💾 Test 1: Save a new configuration");
  const testRecipients = [
    {
      wallet: "0xC94d68094FA65E991dFfa0A941306E8460876169",
      sharePercent: 5000,
      strategy: 0,
    },
    {
      wallet: "0x08D811A358850892029251CcC8a565a32fd2dCB8",
      sharePercent: 3000,
      strategy: 1,
    },
    {
      wallet: "0xC94d68094FA65E991dFfa0A941306E8460876169",
      sharePercent: 2000,
      strategy: 2,
    },
  ];

  console.log("   Saving config...");
  const tx = await registry.saveConfig(
    "Test Gifting Config",
    "Test configuration with 3 recipients",
    testRecipients,
    true
  );
  const receipt = await tx.wait();
  console.log(`   ✅ Config saved! Tx: ${receipt.hash}`);

  const event = receipt.logs
    .map((log: any) => {
      try {
        return registry.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed: any) => parsed && parsed.name === "ConfigSaved");

  const configId = event?.args?.configId ?? event?.args?.[0];
  console.log(`   📝 Config ID: ${configId}`);

  console.log("\n📖 Test 2: Load the configuration");
  const config = await registry.getConfig(configId);
  console.log(`   ID: ${config.id}`);
  console.log(`   Owner: ${config.owner}`);
  console.log(`   Name: ${config.name}`);
  console.log(`   Description: ${config.description}`);
  console.log(`   Recipient Count: ${config.recipientCount}`);
  console.log(`   Is Public: ${config.isPublic}`);

  console.log("\n🎁 Test 3: Inspect recipients");
  for (let i = 0; i < Number(config.recipientCount); i++) {
    const recipient = await registry.getRecipient(configId, i);
    console.log(`   Recipient ${i + 1}:`);
    console.log(`     Wallet: ${recipient.wallet}`);
    console.log(`     Share: ${Number(recipient.sharePercent) / 100}%`);
    console.log(`     Strategy: ${recipient.strategy}`);
  }

  console.log("\n📋 Test 4: Get user configs");
  const userConfigIds = await registry.getUserConfigIds(signer.address);
  console.log(`   User has ${userConfigIds.length} config(s)`);
  userConfigIds.forEach((id: bigint, index: number) => {
    console.log(`     ${index + 1}. Config ID: ${id}`);
  });

  console.log("\n🌐 Test 5: Get public configs");
  const publicConfigIds = await registry.getPublicConfigIds();
  console.log(`   ${publicConfigIds.length} public config(s) available`);
  publicConfigIds.forEach((id: bigint, index: number) => {
    console.log(`     ${index + 1}. Config ID: ${id}`);
  });

  console.log("\n✏️  Test 6: Update configuration");
  const updatedRecipients = [
    {
      wallet: "0xC94d68094FA65E991dFfa0A941306E8460876169",
      sharePercent: 6000,
      strategy: 0,
    },
    {
      wallet: "0x08D811A358850892029251CcC8a565a32fd2dCB8",
      sharePercent: 2000,
      strategy: 1,
    },
    {
      wallet: "0x783140003cFF6C06B230937707eB5222186F0118",
      sharePercent: 2000,
      strategy: 3,
    },
  ];

  console.log("   Updating config...");
  const updateTx = await registry.updateConfig(
    configId,
    "Updated Gifting Config",
    "Updated description",
    updatedRecipients
  );
  await updateTx.wait();
  console.log("   ✅ Config updated!");

  console.log("\n🧹 Test 7: Delete configuration");
  const deleteTx = await registry.deleteConfig(configId);
  await deleteTx.wait();
  console.log("   ✅ Config deleted!");

  console.log("\n✅ All tests completed successfully!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
