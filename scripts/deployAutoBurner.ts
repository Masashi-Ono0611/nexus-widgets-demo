import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AutoBurner...");

  const factory = await ethers.getContractFactory("AutoBurner");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("AutoBurner deployed to:", address);
  console.log("\nTo verify on Basescan:");
  console.log(`npx hardhat verify --network baseSepolia ${address}`);
  console.log("\nUpdate BridgeAndBurnCardBase.tsx with this address:");
  console.log(`contractAddress="${address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
