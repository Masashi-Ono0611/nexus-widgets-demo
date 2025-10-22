import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

async function main() {
  const network = process.env.HARDHAT_NETWORK || "arbitrumSepolia";
  console.log(`\n🚀 Deploying PayrollConfigRegistry to ${network}...`);

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer address: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy PayrollConfigRegistry
  console.log("\n📦 Deploying PayrollConfigRegistry...");
  const PayrollConfigRegistry = await ethers.getContractFactory(
    "PayrollConfigRegistry"
  );
  const registry = await PayrollConfigRegistry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log(`✅ PayrollConfigRegistry deployed to: ${registryAddress}`);

  // Verify initial state
  const nextConfigId = await registry.nextConfigId();
  console.log(`📊 Initial nextConfigId: ${nextConfigId}`);

  console.log("\n✨ Deployment complete!");
  console.log("\n📋 Summary:");
  console.log(`   Network: ${network}`);
  console.log(`   PayrollConfigRegistry: ${registryAddress}`);
  console.log(`   Deployer: ${deployer.address}`);

  // Save deployment info
  console.log("\n💾 Save this address to your frontend configuration:");
  console.log(
    `   export const PAYROLL_CONFIG_REGISTRY_ADDRESS = "${registryAddress}";`
  );

  // Verification instructions
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n🔍 To verify the contract on Etherscan:");
    console.log(
      `   npx hardhat verify --network ${network} ${registryAddress}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
