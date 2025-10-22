import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Base Sepolia addresses
const BASE_SEPOLIA_ADDRESSES = {
  aavePool: "0x0000000000000000000000000000000000000000", // Not available on Base Sepolia
  morphoVault: "0x66DB50A789a15f4A368A1b3dCb05615Be651fc05",
  uniswapV2Pair: "0x0000000000000000000000000000000000000000", // Not available
  weth: "0x0000000000000000000000000000000000000000",
};

// Arbitrum Sepolia addresses
const ARBITRUM_SEPOLIA_ADDRESSES = {
  aavePool: "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff",
  morphoVault: "0xabf102Ed5f977331BdAD74d9136b6bFb7A2F09b6",
  uniswapV2Pair: "0x4F7392b66ADB7D09EdAe3C877714c5992Aeb4671", // USDC/WETH pair
  weth: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
};

// Optimism Sepolia addresses
const OPTIMISM_SEPOLIA_ADDRESSES = {
  aavePool: "0xb50201558B00496A145fE76f7424749556E326D8",
  morphoVault: "0x0000000000000000000000000000000000000000", // Not available
  uniswapV2Pair: "0x0000000000000000000000000000000000000000", // Not available
  weth: "0x0000000000000000000000000000000000000000",
};

async function main() {
  const network = process.env.HARDHAT_NETWORK || "arbitrumSepolia";
  console.log(`\n🚀 Deploying FlexibleSplitter to ${network}...`);

  // Warn if not Arbitrum Sepolia (only network with Uniswap V2)
  if (network !== "arbitrumSepolia") {
    console.log("\n⚠️  WARNING: UNISWAP_V2_SWAP strategy is only available on Arbitrum Sepolia");
    console.log("   Recommended network: arbitrumSepolia");
    console.log("   Set HARDHAT_NETWORK=arbitrumSepolia to deploy there\n");
  }

  // Select addresses based on network
  let addresses;
  switch (network) {
    case "baseSepolia":
      addresses = BASE_SEPOLIA_ADDRESSES;
      break;
    case "arbitrumSepolia":
      addresses = ARBITRUM_SEPOLIA_ADDRESSES;
      break;
    case "optimismSepolia":
      addresses = OPTIMISM_SEPOLIA_ADDRESSES;
      break;
    default:
      console.error(`❌ Unsupported network: ${network}`);
      console.log("Supported networks: baseSepolia, arbitrumSepolia, optimismSepolia");
      process.exit(1);
  }

  // Validate addresses
  if (addresses.aavePool === "0x0000000000000000000000000000000000000000") {
    console.log("⚠️  Warning: AAVE Pool not available on this network");
    console.log("   AAVE Supply strategy will not work");
  }

  if (addresses.morphoVault === "0x0000000000000000000000000000000000000000") {
    console.log("⚠️  Warning: Morpho Vault not available on this network");
    console.log("   Morpho Deposit strategy will not work");
  }

  console.log("\n📋 Constructor Arguments:");
  console.log("  AAVE Pool:", addresses.aavePool);
  console.log("  Morpho Vault:", addresses.morphoVault);
  console.log("  Uniswap V2 Pair:", addresses.uniswapV2Pair);
  console.log("  WETH:", addresses.weth);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("\n👤 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("   Balance:", ethers.formatEther(balance), "ETH");

  // Deploy contract
  console.log("\n⏳ Deploying contract...");
  const FlexibleSplitter = await ethers.getContractFactory(
    "FlexibleSplitter"
  );
  const contract = await FlexibleSplitter.deploy(
    addresses.aavePool,
    addresses.morphoVault,
    addresses.uniswapV2Pair,
    addresses.weth
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ FlexibleSplitter deployed!");
  console.log("   Address:", contractAddress);

  // Verify constructor args
  console.log("\n🔍 Verifying constructor arguments...");
  const aavePool = await contract.aavePool();
  const morphoVault = await contract.morphoVault();
  const uniswapV2Pair = await contract.uniswapV2Pair();
  const weth = await contract.weth();
  console.log("   AAVE Pool:", aavePool);
  console.log("   Morpho Vault:", morphoVault);
  console.log("   Uniswap V2 Pair:", uniswapV2Pair);
  console.log("   WETH:", weth);

  // Next steps
  console.log("\n📝 Next Steps:");
  console.log("1. Update FlexibleSplitterArbitrumCard.tsx:");
  console.log(`   const FLEXIBLE_SPLITTER_ADDRESS = "${contractAddress}";`);
  console.log("\n2. Update .env file:");
  console.log(`   FLEXIBLE_SPLITTER_ADDRESS=${contractAddress}`);
  console.log("\n3. Test the contract:");
  console.log(`   pnpm run test:flexible-splitter`);
  console.log("\n4. Verify on block explorer:");
  console.log(
    `   npx hardhat verify --network ${network} ${contractAddress} "${addresses.aavePool}" "${addresses.morphoVault}" "${addresses.uniswapV2Pair}" "${addresses.weth}"`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
