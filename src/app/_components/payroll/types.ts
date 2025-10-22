// DeFi Strategy enum (must match contract)
export enum DeFiStrategy {
  DIRECT_TRANSFER = 0,
  AAVE_SUPPLY = 1,
  MORPHO_DEPOSIT = 2,
  UNISWAP_V2_SWAP = 3,
}

export interface Recipient {
  wallet: string;
  sharePercent: string;
  strategy: DeFiStrategy;
}

export interface StrategyAllocation {
  strategy: DeFiStrategy;
  subPercent: string;
}

export interface WalletGroup {
  wallet: string;
  walletAmount: string;
  strategies: StrategyAllocation[];
}

export const RECURRING_SPLITTER_ADDRESS = "0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E";
export const FLEXIBLE_SPLITTER_ADDRESS = "0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454";

export const STRATEGY_LABELS: Record<DeFiStrategy, string> = {
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

export const WALLET_COLORS = ["#1565C0", "#2E7D32", "#EF6C00", "#6A1B9A", "#00838F"];
