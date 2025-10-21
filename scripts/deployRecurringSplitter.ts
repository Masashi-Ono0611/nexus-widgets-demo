import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Arbitrum Sepolia addresses
const ARBITRUM_SEPOLIA_ADDRESSES = {
  aavePool: "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff",
  morphoVault: "0xabf102Ed5f977331BdAD74d9136b6bFb7A2F09b6",
};

async function main() {
  const network = process.env.HARDHAT_NETWORK || "arbitrumSepolia";
  console.log(`\n🚀 Deploying RecurringSplitter to ${network}...`);

  if (network !== "arbitrumSepolia") {
    console.error("❌ This contract is designed for Arbitrum Sepolia only");
    process.exit(1);
  }

  const addresses = ARBITRUM_SEPOLIA_ADDRESSES;

  console.log("\n📋 Constructor Arguments:");
  console.log("  AAVE Pool:", addresses.aavePool);
  console.log("  Morpho Vault:", addresses.morphoVault);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("\n👤 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("   Balance:", ethers.formatEther(balance), "ETH");

  // Deploy contract
  console.log("\n⏳ Deploying contract...");
  const RecurringSplitter = await ethers.getContractFactory(
    "RecurringSplitter"
  );
  const contract = await RecurringSplitter.deploy(
    addresses.aavePool,
    addresses.morphoVault
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ RecurringSplitter deployed!");
  console.log("   Address:", contractAddress);

  // Verify constructor args
  console.log("\n🔍 Verifying constructor arguments...");
  const aavePool = await contract.aavePool();
  const morphoVault = await contract.morphoVault();
  const gelatoAutomate = await contract.GELATO_AUTOMATE();
  console.log("   AAVE Pool:", aavePool);
  console.log("   Morpho Vault:", morphoVault);
  console.log("   Gelato Automate:", gelatoAutomate);

  // Next steps
  console.log("\n📝 Next Steps:");
  console.log("1. Update RecurringSplitterCard.tsx:");
  console.log(`   const RECURRING_SPLITTER_ADDRESS = "${contractAddress}";`);
  console.log("\n2. Fund contract with ETH for Gelato fees:");
  console.log(`   Send some ETH to ${contractAddress}`);
  console.log("\n3. Test the contract:");
  console.log(`   pnpm run test:recurring-splitter`);
  console.log("\n4. Verify on block explorer:");
  console.log(
    `   npx hardhat verify --network ${network} ${contractAddress} "${addresses.aavePool}" "${addresses.morphoVault}"`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
