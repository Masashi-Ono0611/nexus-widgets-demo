// Utility functions for Gifting Manager
import { RecipientWallet, ValidationError, Strategy, Recipient, DeFiStrategy } from './types';

export const isValidAddress = (address: string): boolean => {
  return !!address && address.startsWith('0x') && address.length === 42;
};

export const validateRecipientWallets = (recipientWallets: RecipientWallet[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check total recipients
  if (recipientWallets.length > 20) {
    errors.push({
      field: 'recipients',
      message: `Maximum 20 recipients allowed. Current: ${recipientWallets.length}`,
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

    // Share percentage validation
    if (wallet.sharePercent < 0 || wallet.sharePercent > 100) {
      errors.push({
        walletId: wallet.id,
        field: 'sharePercent',
        message: 'Share percentage must be between 0 and 100.',
      });
    }
  });

  return errors;
};

export const calculateTotalPercentage = (recipientWallets: RecipientWallet[]): number => {
  return recipientWallets.reduce((sum, wallet) => sum + wallet.sharePercent, 0);
};

export const normalizePercentages = (recipientWallets: RecipientWallet[]): RecipientWallet[] => {
  const total = calculateTotalPercentage(recipientWallets);

  if (total === 0) {
    return recipientWallets.map((wallet, index) => ({
      ...wallet,
      sharePercent: 100 / recipientWallets.length,
    }));
  }

  return recipientWallets.map(wallet => ({
    ...wallet,
    sharePercent: (wallet.sharePercent / total) * 100,
  }));
};

export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
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

// Convert RecipientWallet[] to Recipient[] for contract compatibility
export function convertToRecipients(recipientWallets: RecipientWallet[]): Recipient[] {
  return recipientWallets.map((wallet) => ({
    wallet: wallet.address,
    sharePercent: wallet.sharePercent.toString(),
    strategy: wallet.strategy,
  }));
}

// Build flat recipients from RecipientWallet[] directly
export function buildFlatRecipientsFromWallets(recipientWallets: RecipientWallet[]): Recipient[] {
  return convertToRecipients(recipientWallets);
}