// Utility functions for Payroll Manager
import { RecipientWallet, ValidationError, Strategy } from './types';

export const isValidAddress = (address: string): boolean => {
  return address.startsWith('0x') && address.length === 42;
};

export const validateRecipientWallets = (recipientWallets: RecipientWallet[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check total recipients
  const totalRecipients = recipientWallets.reduce((sum, wallet) => {
    return sum + wallet.strategies.filter(s => s.percentage > 0).length;
  }, 0);

  if (totalRecipients > 20) {
    errors.push({
      field: 'recipients',
      message: `Maximum 20 recipients allowed. Current: ${totalRecipients}`,
    });
  }

  // Validate each recipient wallet
  recipientWallets.forEach((wallet) => {
    // Address validation
    if (!isValidAddress(wallet.address)) {
      errors.push({
        walletId: wallet.id,
        field: 'address',
        message: 'Invalid wallet address. Must start with 0x and be 42 characters.',
      });
    }

    // Amount validation
    if (wallet.amount <= 0) {
      errors.push({
        walletId: wallet.id,
        field: 'amount',
        message: 'Amount must be greater than 0.',
      });
    }

    // Strategy percentage validation
    const totalPercentage = wallet.strategies.reduce((sum, s) => sum + s.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push({
        walletId: wallet.id,
        field: 'strategies',
        message: `Strategy allocations must sum to 100%. Current: ${totalPercentage.toFixed(1)}%`,
      });
    }
  });

  return errors;
};

export const calculateTotalAmount = (recipientWallets: RecipientWallet[]): number => {
  return recipientWallets.reduce((sum, wallet) => sum + wallet.amount, 0);
};

export const calculateWalletPercentages = (recipientWallets: RecipientWallet[]): { [key: string]: number } => {
  const total = calculateTotalAmount(recipientWallets);
  const percentages: { [key: string]: number } = {};

  recipientWallets.forEach((wallet) => {
    percentages[wallet.id] = total > 0 ? (wallet.amount / total) * 100 : 0;
  });

  return percentages;
};

export const normalizeStrategies = (strategies: Strategy[]): Strategy[] => {
  const total = strategies.reduce((sum, s) => sum + s.percentage, 0);
  
  if (total === 0) {
    return strategies.map(s => ({ ...s, percentage: 25 }));
  }

  return strategies.map(s => ({
    ...s,
    percentage: (s.percentage / total) * 100,
  }));
};

export const applyPreset = (strategies: Strategy[], preset: 'equal-split' | 'defi-focused' | 'direct-only' | 'normalize'): Strategy[] => {
  switch (preset) {
    case 'equal-split':
      return strategies.map(s => ({ ...s, percentage: 25 }));
    case 'defi-focused':
      return strategies.map((s, i) => ({
        ...s,
        percentage: [10, 20, 30, 40][i] || 0,
      }));
    case 'direct-only':
      return strategies.map((s, i) => ({
        ...s,
        percentage: i === 0 ? 100 : 0,
      }));
    case 'normalize':
      return normalizeStrategies(strategies);
    default:
      return strategies;
  }
};

export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatUSDC = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};