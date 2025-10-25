// Utility functions for Payroll Manager
import { RecipientWallet, ValidationError, Strategy, Recipient, WalletGroup } from './types';

export const isValidAddress = (address: string): boolean => {
  return !!address && address.startsWith('0x') && address.length === 42;
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
  return `${amount.toFixed(2)} USDC`;
};

// Contract integration utilities
export function toContractRecipients(recipients: Recipient[]) {
  return recipients.map((r) => ({
    wallet: r.wallet as `0x${string}`,
    sharePercent: Math.round(parseFloat(r.sharePercent || "0") * 100),
    strategy: r.strategy,
  }));
}

export function totalShare(recipients: Recipient[]): number {
  return recipients.reduce((sum, r) => sum + (parseFloat(r.sharePercent) || 0), 0);
}

export function sumPercent(values: string[]): number {
  return values.reduce((s, v) => s + (parseFloat(v) || 0), 0);
}

// Convert RecipientWallet[] to WalletGroup[] for contract compatibility
export function convertToWalletGroups(recipientWallets: RecipientWallet[]): WalletGroup[] {
  return recipientWallets.map((wallet) => ({
    wallet: wallet.address,
    walletAmount: wallet.amount.toString(),
    strategies: wallet.strategies.map((s) => ({
      strategy: s.strategyEnum,
      subPercent: s.percentage.toString(),
    })),
  }));
}

// Build flat recipients from wallet groups for contract
export function buildFlatRecipientsFromGroups(groups: WalletGroup[], totalAmount: number): Recipient[] {
  const result: Recipient[] = [];
  if (!totalAmount || totalAmount <= 0) return result;
  for (const g of groups) {
    const walletAmt = parseFloat(g.walletAmount) || 0;
    const walletPct = (walletAmt / totalAmount) * 100; // wallet share in %
    for (const s of g.strategies) {
      const sub = parseFloat(s.subPercent) || 0;
      const overallPercent = (walletPct * sub) / 100; // overall % of total
      if (overallPercent > 0) {
        result.push({
          wallet: g.wallet,
          sharePercent: overallPercent.toString(),
          strategy: s.strategy,
        });
      }
    }
  }
  return result;
}

// Build flat recipients from RecipientWallet[] directly
export function buildFlatRecipientsFromWallets(recipientWallets: RecipientWallet[]): Recipient[] {
  const totalAmount = calculateTotalAmount(recipientWallets);
  const walletGroups = convertToWalletGroups(recipientWallets);
  return buildFlatRecipientsFromGroups(walletGroups, totalAmount);
}