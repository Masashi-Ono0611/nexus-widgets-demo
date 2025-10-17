import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MockAavePool to Optimism Sepolia...");

  const factory = await ethers.getContractFactory("MockAavePool");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("MockAavePool deployed to:", address);
  console.log("\nTo verify on Optimism Etherscan:");
  console.log(`npx hardhat verify --network optimismSepolia ${address}`);
  console.log("\nUpdate BridgeAndExecuteCard.tsx (or new component) with this address:");
  console.log(`contractAddress="${address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
