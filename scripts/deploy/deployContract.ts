import hardhat from "hardhat";

const hre = hardhat as unknown as any;

function getArgValue(flag: string) {
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === flag && typeof argv[i + 1] === "string") {
      return argv[i + 1];
    }
  }
  return undefined;
}

export async function deployContract() {
  const contractName =
    process.env.CONTRACT_NAME ??
    process.env.DEPLOY_CONTRACT ??
    getArgValue("--contract") ??
    getArgValue("--contractName");

  if (!contractName) {
    throw new Error(
      "Contract name not provided. Set CONTRACT_NAME env or pass --contract <Name> when running directly.",
    );
  }

  const description =
    process.env.CONTRACT_DESCRIPTION ??
    process.env.DEPLOY_CONTRACT_DESCRIPTION ??
    getArgValue("--description");

  const label = description ?? contractName;
  const network = process.env.HARDHAT_NETWORK ?? "baseSepolia";

  console.log(`Deploying ${label}...`);

  const factory = await hre.ethers.getContractFactory(contractName);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log(`${contractName} deployed to: ${address}`);
  console.log("\nTo verify on blockscan:");
  console.log(`npx hardhat verify --network ${network} ${address}`);
  console.log(`contractAddress="${address}"`);
}

async function runFromCli() {
  try {
    await deployContract();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

const executedDirectly = (() => {
  try {
    const scriptPath = process.argv[1];
    if (!scriptPath) return false;
    return new URL(`file://${scriptPath}`).href === import.meta.url;
  } catch {
    return false;
  }
})();

if (executedDirectly) {
  runFromCli();
}

// Sample commands
// HARDHAT_NETWORK=arbitrumSepolia pnpm run deploy:auto-splitter