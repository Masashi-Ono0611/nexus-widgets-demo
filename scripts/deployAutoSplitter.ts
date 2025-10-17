import hardhat from "hardhat";

const hre = hardhat as unknown as any;

async function main() {
  console.log("Deploying AutoSplitter...");

  const factory = await hre.ethers.getContractFactory("AutoSplitter");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("AutoSplitter deployed to:", address);
  console.log("\nTo verify on Basescan:");
  console.log(`npx hardhat verify --network baseSepolia ${address}`);
  console.log("\nUpdate BridgeAndSplitCardBase.tsx with this address:");
  console.log(`contractAddress="${address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
