// Type definitions for Payroll Manager

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
  amount: number;
  color: string;
  strategies: Strategy[];
}

// Contract-compatible types
export interface StrategyAllocation {
  strategy: DeFiStrategy;
  subPercent: string;
}

export interface WalletGroup {
  wallet: string;
  walletAmount: string;
  strategies: StrategyAllocation[];
}

export interface Recipient {
  wallet: string;
  sharePercent: string;
  strategy: DeFiStrategy;
}

export interface PayrollConfig {
  id?: string;
  name: string;
  description: string;
  isPublic: boolean;
  owner?: string;
  recipientWallets: RecipientWallet[];
  executionMode: 'immediate' | 'recurring';
  recurringInterval?: number;
  maxExecutions?: number;
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
  PayrollConfigRegistry: '0x1d5dF7B4553c78318DB8F4833BD22fE92E32F2D7',
};

export const RECURRING_SPLITTER_ADDRESS = "0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E";
export const FLEXIBLE_SPLITTER_ADDRESS = "0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454";
export const PAYROLL_CONFIG_REGISTRY_ADDRESS = "0x1d5dF7B4553c78318DB8F4833BD22fE92E32F2D7";

export const STRATEGY_LABELS: Record<number, string> = {
  [DeFiStrategy.DIRECT_TRANSFER]: "Direct Transfer",
  [DeFiStrategy.AAVE_SUPPLY]: "AAVE Supply",
  [DeFiStrategy.MORPHO_DEPOSIT]: "Morpho Deposit",
  [DeFiStrategy.UNISWAP_V2_SWAP]: "Uniswap V2 Swap (USDC→WETH)",
};

export const STRATEGY_COLORS: Record<number, string> = {
  [DeFiStrategy.DIRECT_TRANSFER]: "#4CAF50",
  [DeFiStrategy.AAVE_SUPPLY]: "#1976D2",
  [DeFiStrategy.MORPHO_DEPOSIT]: "#8E24AA",
  [DeFiStrategy.UNISWAP_V2_SWAP]: "#F57C00",
};