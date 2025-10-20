require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL ?? "";
const BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY = process.env.BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY ?? "";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY ?? "";
const OPTIMISM_SEPOLIA_RPC_URL = process.env.OPTIMISM_SEPOLIA_RPC_URL ?? "";
const OPTIMISM_SEPOLIA_DEPLOYER_PRIVATE_KEY = process.env.OPTIMISM_SEPOLIA_DEPLOYER_PRIVATE_KEY ?? "";
const OPTIMISM_ETHERSCAN_API_KEY = process.env.OPTIMISM_ETHERSCAN_API_KEY ?? "";
const ARBITRUM_SEPOLIA_RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL ?? "";
const ARBITRUM_SEPOLIA_DEPLOYER_PRIVATE_KEY = process.env.ARBITRUM_SEPOLIA_DEPLOYER_PRIVATE_KEY ?? "";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY ?? "";

module.exports = {
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
      accounts: BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY ? [BASE_SEPOLIA_DEPLOYER_PRIVATE_KEY] : undefined,
    },
    optimismSepolia: {
      url: OPTIMISM_SEPOLIA_RPC_URL || undefined,
      accounts: OPTIMISM_SEPOLIA_DEPLOYER_PRIVATE_KEY ? [OPTIMISM_SEPOLIA_DEPLOYER_PRIVATE_KEY] : undefined,
    },
    arbitrumSepolia: {
      url: ARBITRUM_SEPOLIA_RPC_URL || undefined,
      accounts: ARBITRUM_SEPOLIA_DEPLOYER_PRIVATE_KEY ? [ARBITRUM_SEPOLIA_DEPLOYER_PRIVATE_KEY] : undefined,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY ?? "",
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io",
        },
      },
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io",
        },
      },
    ],
  },
};
