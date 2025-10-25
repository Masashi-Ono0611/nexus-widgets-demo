// Type definitions for Gifting Manager (GiftingConfigRegistry compatible)

// DeFi Strategy enum (must match contract)
export enum DeFiStrategy {
  DIRECT_TRANSFER = 0,
  AAVE_SUPPLY = 1,
  MORPHO_DEPOSIT = 2,
  UNISWAP_V2_SWAP = 3,
}

export interface Strategy {
  name: string;
  percentage: number;
  color: string;
  address: string;
  strategyEnum: DeFiStrategy;
}

export interface RecipientWallet {
  id: string;
  address: string;
  sharePercent: number; // Percentage (0-100)
  color: string;
  strategy: DeFiStrategy; // Single strategy per recipient
}

// Contract-compatible types
export interface Recipient {
  wallet: string;
  sharePercent: string;
  strategy: DeFiStrategy;
}

export interface ValidationError {
  walletId?: string;
  field: string;
  message: string;
}

export const STRATEGY_TEMPLATES: Strategy[] = [
  { name: 'Direct Transfer', color: '#4CAF50', address: '0x0000000000000000000000000000000000000001', strategyEnum: DeFiStrategy.DIRECT_TRANSFER, percentage: 25 },
  { name: 'AAVE Supply', color: '#1976D2', address: '0x0000000000000000000000000000000000000002', strategyEnum: DeFiStrategy.AAVE_SUPPLY, percentage: 25 },
  { name: 'Morpho Deposit', color: '#8E24AA', address: '0x0000000000000000000000000000000000000003', strategyEnum: DeFiStrategy.MORPHO_DEPOSIT, percentage: 25 },
  { name: 'Uniswap Swap', color: '#F57C00', address: '0x0000000000000000000000000000000000000004', strategyEnum: DeFiStrategy.UNISWAP_V2_SWAP, percentage: 25 },
];

export const WALLET_COLORS = ['#1565C0', '#2E7D32', '#EF6C00', '#6A1B9A', '#00838F'];

export const CONTRACT_ADDRESSES = {
  FlexibleSplitter: '0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454',
  RecurringSplitter: '0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E',
  GiftingConfigRegistry: '0x2e14Dc0A48F5d700695fc0c15b35bcf24761756F',
};

export const RECURRING_SPLITTER_ADDRESS = "0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E";
export const FLEXIBLE_SPLITTER_ADDRESS = "0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454";
export const GIFTING_CONFIG_REGISTRY_ADDRESS = "0x2e14Dc0A48F5d700695fc0c15b35bcf24761756F";

export const STRATEGY_LABELS: Record<number, string> = {
  [DeFiStrategy.DIRECT_TRANSFER]: "Direct Transfer",
  [DeFiStrategy.AAVE_SUPPLY]: "AAVE Supply",
  [DeFiStrategy.MORPHO_DEPOSIT]: "Morpho Deposit",
  [DeFiStrategy.UNISWAP_V2_SWAP]: "Uniswap V2 Swap (USDC→WETH)",
};

export const STRATEGY_COLORS: Record<number, string> = {
  [DeFiStrategy.DIRECT_TRANSFER]: "#22C55E", // Green 500 - Success theme
  [DeFiStrategy.AAVE_SUPPLY]: "#3B82F6",     // Blue 500 - Info theme
  [DeFiStrategy.MORPHO_DEPOSIT]: "#8B5CF6",  // Purple 500 - Accent theme
  [DeFiStrategy.UNISWAP_V2_SWAP]: "#EAB308", // Yellow 500 - Warning theme
};