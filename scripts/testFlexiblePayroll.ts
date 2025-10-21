import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Contract address (deployed on Base Sepolia)
const FLEXIBLE_PAYROLL_ADDRESS = "0xF9a078A740203Fd51544CD348f8a063a8b63Da86";

// Base Sepolia addresses
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const AAVE_POOL_ADDRESS = "0x0000000000000000000000000000000000000000"; // Not available on Base Sepolia
const MORPHO_VAULT_ADDRESS = "0x66DB50A789a15f4A368A1b3dCb05615Be651fc05";

// DeFi Strategy enum
enum DeFiStrategy {
  DIRECT_TRANSFER = 0,
  AAVE_SUPPLY = 1,
  MORPHO_DEPOSIT = 2,
}

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing with account:", signer.address);

  // Get contract instance
  const contract = await ethers.getContractAt(
    "FlexiblePayrollSplitter",
    FLEXIBLE_PAYROLL_ADDRESS
  );

  console.log("\n📋 Contract Information");
  console.log("Contract Address:", FLEXIBLE_PAYROLL_ADDRESS);
  console.log("AAVE Pool:", await contract.aavePool());
  console.log("Morpho Vault:", await contract.morphoVault());

  // Get USDC contract
  const usdc = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    USDC_ADDRESS
  );

  // Check USDC balance
  const balance = await usdc.balanceOf(signer.address);
  console.log("\n💰 USDC Balance:", ethers.formatUnits(balance, 6), "USDC");

  if (balance === 0n) {
    console.log("\n⚠️  No USDC balance. Get testnet USDC from:");
    console.log("https://faucet.circle.com/");
    return;
  }

  // Example recipients configuration
  const recipients = [
    {
      wallet: "0xC94d68094FA65E991dFfa0A941306E8460876169",
      sharePercent: 5000, // 50% in basis points
      strategy: DeFiStrategy.DIRECT_TRANSFER,
    },
    {
      wallet: "0x08D811A358850892029251CcC8a565a32fd2dCB8",
      sharePercent: 3000, // 30%
      strategy: DeFiStrategy.MORPHO_DEPOSIT,
    },
    {
      wallet: signer.address,
      sharePercent: 2000, // 20%
      strategy: DeFiStrategy.DIRECT_TRANSFER,
    },
  ];

  const amount = ethers.parseUnits("10", 6); // 10 USDC

  console.log("\n📊 Distribution Preview");
  console.log("Total Amount:", ethers.formatUnits(amount, 6), "USDC");
  console.log("\nRecipients:");
  recipients.forEach((r, i) => {
    const recipientAmount = (amount * BigInt(r.sharePercent)) / 10000n;
    const strategyName =
      r.strategy === DeFiStrategy.DIRECT_TRANSFER
        ? "Direct Transfer"
        : r.strategy === DeFiStrategy.AAVE_SUPPLY
          ? "AAVE Supply"
          : "Morpho Deposit";
    console.log(
      `  ${i + 1}. ${r.wallet.slice(0, 6)}...${r.wallet.slice(-4)}: ${ethers.formatUnits(recipientAmount, 6)} USDC (${r.sharePercent / 100}%) - ${strategyName}`
    );
  });

  // Preview distribution
  const previewAmounts = await contract.previewDistribution(amount, recipients);
  console.log("\n🔍 Contract Preview:");
  previewAmounts.forEach((amt, i) => {
    console.log(`  Recipient ${i + 1}:`, ethers.formatUnits(amt, 6), "USDC");
  });

  // Check allowance
  const allowance = await usdc.allowance(signer.address, FLEXIBLE_PAYROLL_ADDRESS);
  console.log("\n🔐 Current Allowance:", ethers.formatUnits(allowance, 6), "USDC");

  if (allowance < amount) {
    console.log("\n⏳ Approving USDC...");
    const approveTx = await usdc.approve(FLEXIBLE_PAYROLL_ADDRESS, amount);
    await approveTx.wait();
    console.log("✅ Approved");
  }

  // Execute distribution
  console.log("\n⏳ Distributing payroll...");
  const tx = await contract.distributePayroll(USDC_ADDRESS, amount, recipients);
  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Distribution completed!");
  console.log("Gas used:", receipt?.gasUsed.toString());

  // Parse events
  if (receipt?.logs) {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });

        if (parsed?.name === "RecipientPaid") {
          const [recipient, asset, paidAmount, strategy] = parsed.args;
          const strategyName =
            strategy === 0
              ? "Direct Transfer"
              : strategy === 1
                ? "AAVE Supply"
                : "Morpho Deposit";
          console.log(
            `  💸 Paid ${ethers.formatUnits(paidAmount, 6)} USDC to ${recipient.slice(0, 6)}...${recipient.slice(-4)} via ${strategyName}`
          );
        }
      } catch (e) {
        // Skip non-contract logs
      }
    }
  }

  // Check final balances
  console.log("\n📊 Final Balances:");
  const finalBalance = await usdc.balanceOf(signer.address);
  console.log("Your USDC:", ethers.formatUnits(finalBalance, 6), "USDC");

  for (let i = 0; i < recipients.length; i++) {
    if (recipients[i].strategy === DeFiStrategy.DIRECT_TRANSFER) {
      const recipientBalance = await usdc.balanceOf(recipients[i].wallet);
      console.log(
        `Recipient ${i + 1}:`,
        ethers.formatUnits(recipientBalance, 6),
        "USDC"
      );
    } else if (recipients[i].strategy === DeFiStrategy.MORPHO_DEPOSIT) {
      const morpho = await ethers.getContractAt(
        [
          "function balanceOf(address) view returns (uint256)",
          "function convertToAssets(uint256) view returns (uint256)",
        ],
        MORPHO_VAULT_ADDRESS
      );
      const shares = await morpho.balanceOf(recipients[i].wallet);
      const assets = await morpho.convertToAssets(shares);
      console.log(
        `Recipient ${i + 1} (Morpho):`,
        ethers.formatUnits(assets, 6),
        "USDC worth of shares"
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
