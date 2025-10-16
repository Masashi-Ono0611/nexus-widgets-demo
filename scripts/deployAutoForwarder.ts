import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AutoForwarder...");

  const factory = await ethers.getContractFactory("AutoForwarder");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("AutoForwarder deployed to:", address);
  console.log("\nTo verify on Basescan:");
  console.log(`npx hardhat verify --network baseSepolia ${address}`);
  console.log("\nUpdate BridgeAndForwardCardBase.tsx (or other component) with this address:");
  console.log(`contractAddress="${address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
