import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const recipientCsv = process.env.SPLITTER_RECIPIENTS ?? "";
  const shareCsv = process.env.SPLITTER_SHARES ?? "";
  const ownerAddress = process.env.SPLITTER_OWNER_ADDRESS;

  const recipients = recipientCsv
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const shares = shareCsv
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => BigInt(entry));

  if (recipients.length === 0 || shares.length === 0) {
    throw new Error(
      "SPLITTER_RECIPIENTS and SPLITTER_SHARES must be provided as comma-separated values"
    );
  }

  if (recipients.length !== shares.length) {
    throw new Error("Recipients and shares length mismatch");
  }

  const [defaultSigner] = await ethers.getSigners();
  const deployer = ownerAddress ?? defaultSigner.address;

  console.log("Deploying PaymentSplitter with:");
  console.log("  Recipients:", recipients);
  console.log("  Shares:", shares.map((s) => s.toString()));
  console.log("  Owner:", deployer);

  const factory = await ethers.getContractFactory("PaymentSplitter");
  const contract = await factory.deploy(recipients, shares, deployer);
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("PaymentSplitter deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
