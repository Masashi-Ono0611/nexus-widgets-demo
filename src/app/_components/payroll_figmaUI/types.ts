// Type definitions for Payroll Manager

export interface Strategy {
  name: string;
  percentage: number;
  color: string;
  address: string;
}

export interface RecipientWallet {
  id: string;
  address: string;
  amount: number;
  color: string;
  strategies: Strategy[];
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

export const STRATEGY_TEMPLATES = [
  { name: 'Direct Transfer', color: '#4CAF50', address: '0x0000000000000000000000000000000000000001' },
  { name: 'AAVE Supply', color: '#1976D2', address: '0x0000000000000000000000000000000000000002' },
  { name: 'Morpho Deposit', color: '#8E24AA', address: '0x0000000000000000000000000000000000000003' },
  { name: 'Uniswap Swap', color: '#F57C00', address: '0x0000000000000000000000000000000000000004' },
];

export const WALLET_COLORS = ['#1565C0', '#2E7D32', '#EF6C00', '#6A1B9A', '#00838F'];

export const CONTRACT_ADDRESSES = {
  FlexibleSplitter: '0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454',
  RecurringSplitter: '0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E',
  PayrollConfigRegistry: '0x1d5dF7B4553c78318DB8F4833BD22fE92E32F2D7',
};