import hardhat from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const hre = hardhat as unknown as any;
const ethers = hre.ethers;

// Contract address (deployed on Arbitrum Sepolia)
const FLEXIBLE_SPLITTER_ADDRESS = "0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454";

// Arbitrum Sepolia addresses
const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
const AAVE_POOL_ADDRESS = "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff";
const MORPHO_VAULT_ADDRESS = "0xabf102Ed5f977331BdAD74d9136b6bFb7A2F09b6";

// DeFi Strategy enum
enum DeFiStrategy {
  DIRECT_TRANSFER = 0,
  AAVE_SUPPLY = 1,
  MORPHO_DEPOSIT = 2,
  UNISWAP_V2_SWAP = 3,
}

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing with account:", signer.address);

  // Get contract instance
  const contract = await ethers.getContractAt(
    "FlexibleSplitter",
    FLEXIBLE_SPLITTER_ADDRESS
  );

  console.log("\n📋 Contract Information");
  console.log("Contract Address:", FLEXIBLE_SPLITTER_ADDRESS);
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

  // Example recipients configuration - Testing all 4 strategies
  const recipients = [
    {
      wallet: "0xC94d68094FA65E991dFfa0A941306E8460876169",
      sharePercent: 4000, // 40% in basis points
      strategy: DeFiStrategy.MORPHO_DEPOSIT,
    },
    {
      wallet: "0x08D811A358850892029251CcC8a565a32fd2dCB8",
      sharePercent: 3000, // 30%
      strategy: DeFiStrategy.AAVE_SUPPLY,
    },
    {
      wallet: signer.address,
      sharePercent: 2000, // 20%
      strategy: DeFiStrategy.DIRECT_TRANSFER,
    },
    {
      wallet: signer.address,
      sharePercent: 1000, // 10%
      strategy: DeFiStrategy.UNISWAP_V2_SWAP,
    },
  ];

  const amount = ethers.parseUnits("1", 6); // 1 USDC

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
          : r.strategy === DeFiStrategy.MORPHO_DEPOSIT
            ? "Morpho Deposit"
            : "Uniswap V2 Swap";
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
  const allowance = await usdc.allowance(signer.address, FLEXIBLE_SPLITTER_ADDRESS);
  console.log("\n🔐 Current Allowance:", ethers.formatUnits(allowance, 6), "USDC");

  if (allowance < amount) {
    console.log("\n⏳ Approving USDC...");
    const approveTx = await usdc.approve(FLEXIBLE_SPLITTER_ADDRESS, amount);
    await approveTx.wait();
    console.log("✅ Approved");
  }

  // Execute distribution
  console.log("\n⏳ Distributing tokens...");
  const tx = await contract.distributeTokens(USDC_ADDRESS, amount, recipients);
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
          let strategyName;
          if (strategy === 0) {
            strategyName = "Direct Transfer";
          } else if (strategy === 1) {
            strategyName = "AAVE Supply";
          } else if (strategy === 2) {
            strategyName = "Morpho Deposit";
          } else {
            strategyName = "Unknown";
          }
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
