import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MockAaveStakePool...");

  const factory = await ethers.getContractFactory("MockAaveStakePool");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("MockAaveStakePool deployed to:", address);
  console.log("\nTo verify on Basescan:");
  console.log(`npx hardhat verify --network baseSepolia ${address}`);
  console.log("\nUpdate BridgeAndStakeCardBase.tsx with this address:");
  console.log(`contractAddress="${address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
