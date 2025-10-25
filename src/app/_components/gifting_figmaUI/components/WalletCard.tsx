import React from 'react';
import { RecipientWallet, ValidationError, DeFiStrategy, STRATEGY_LABELS, STRATEGY_COLORS } from '../types';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { formatAddress } from '../utils';
import { Trash2, Wallet } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { COLORS, FONT_SIZES } from '../design-tokens';

interface WalletCardProps {
  wallet: RecipientWallet;
  index: number;
  onChange: (wallet: RecipientWallet) => void;
  onRemove: () => void;
  errors: ValidationError[];
  canRemove: boolean;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  index,
  onChange,
  onRemove,
  errors,
  canRemove,
}) => {
  const walletErrors = errors.filter((e) => e.walletId === wallet.id);
  const hasErrors = walletErrors.length > 0;

  const handleStrategyChange = (strategy: DeFiStrategy) => {
    onChange({ ...wallet, strategy });
  };

  const handleSharePercentChange = (sharePercent: number) => {
    onChange({ ...wallet, sharePercent });
  };

  return (
    <Card className="p-8 space-y-4" style={{ borderColor: wallet.color }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: wallet.color + '20' }}
          >
            <Wallet className="h-5 w-5" style={{ color: wallet.color }} />
          </div>
          <div>
            <h3 className="font-semibold">Recipient {index + 1}</h3>
            {wallet.address && (
              <p className={`${FONT_SIZES.bodyMedium} ${COLORS.textSecondary}`}>{formatAddress(wallet.address)}</p>
            )}
          </div>
        </div>
        {canRemove && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className={`${COLORS.status.error.text} ${COLORS.status.error.hover.replace('hover:', 'hover:')} ${COLORS.status.error.background.replace('bg-', 'hover:bg-')} ${COLORS.status.error.border.replace('border-', 'hover:border-')} ${COLORS.status.error.border}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Wallet Address */}
      <div className="space-y-1 mt-[-4px]">
        <label className="text-sm">Wallet Address</label>
        <Input
          placeholder="0x..."
          value={wallet.address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...wallet, address: e.target.value })}
          className={walletErrors.some((e) => e.field === 'address') ? COLORS.status.error.border : ''}
        />
      </div>

      {/* Share Percentage */}
      <div className="space-y-1">
        <label className="text-sm">Share Percentage (%)</label>
        <Input
          type="number"
          placeholder="25.0"
          min="0"
          max="100"
          step="0.1"
          value={wallet.sharePercent || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSharePercentChange(parseFloat(e.target.value) || 0)}
          className={walletErrors.some((e) => e.field === 'sharePercent') ? COLORS.status.error.border : ''}
        />
      </div>

      {/* Strategy Selection */}
      <div className="space-y-1">
        <label className="text-sm">DeFi Strategy</label>
        <Select
          value={wallet.strategy.toString()}
          onValueChange={(value) => handleStrategyChange(parseInt(value) as DeFiStrategy)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STRATEGY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: STRATEGY_COLORS[parseInt(value)] }}
                  />
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 mt-1">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: STRATEGY_COLORS[wallet.strategy] }}
          />
          <span className="text-sm text-gray-600">
            {STRATEGY_LABELS[wallet.strategy]}
          </span>
        </div>
      </div>

      {/* Error Messages */}
      {hasErrors && (
        <div className="space-y-1">
          {walletErrors.map((error, idx) => (
            <div
              key={idx}
              className={`${COLORS.status.error.text} ${COLORS.status.error.background} p-2 rounded`}
            >
              {error.message}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};