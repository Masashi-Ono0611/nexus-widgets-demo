import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL ?? "";
const BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY =
  process.env.BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY ?? "";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY ?? "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL || undefined,
      accounts: BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY
        ? [BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY]
        : undefined,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: BASESCAN_API_KEY,
    },
  },
};

export default config;
