import hre from "hardhat";

async function main() {
  console.log("Deploying GiftingConfigRegistry...");

  const GiftingConfigRegistry = await hre.ethers.getContractFactory("GiftingConfigRegistry");
  const registry = await GiftingConfigRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`GiftingConfigRegistry deployed to: ${address}`);

  // Wait for block confirmations before verification
  console.log("Waiting for block confirmations...");
  await registry.deploymentTransaction()?.wait(5);

  // Verify contract on Etherscan
  try {
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified");
    } else {
      console.error("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
