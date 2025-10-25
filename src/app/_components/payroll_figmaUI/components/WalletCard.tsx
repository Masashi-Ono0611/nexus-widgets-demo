import React from 'react';
import { RecipientWallet, ValidationError } from '../types';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { StrategyRow } from './StrategyRow';
import { applyPreset, formatAddress } from '../utils';
import { Trash2, Wallet } from 'lucide-react';
import { Badge } from '../../ui/badge';
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

  const totalStrategyPercentage = wallet.strategies.reduce((sum, s) => sum + s.percentage, 0);
  const isStrategyValid = Math.abs(totalStrategyPercentage - 100) < 0.01;

  const handleStrategyChange = (strategyIndex: number, percentage: number) => {
    const newStrategies = [...wallet.strategies];
    newStrategies[strategyIndex] = { ...newStrategies[strategyIndex], percentage };
    onChange({ ...wallet, strategies: newStrategies });
  };

  const handlePreset = (preset: 'equal-split' | 'defi-focused' | 'direct-only' | 'normalize') => {
    const newStrategies = applyPreset(wallet.strategies, preset);
    onChange({ ...wallet, strategies: newStrategies });
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
            <h3 className="font-semibold">Recipient Wallet {index + 1}</h3>
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

      {/* Amount */}
      <div className="space-y-1">
        <label className="text-sm">Amount (USDC)</label>
        <Input
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={wallet.amount || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...wallet, amount: parseFloat(e.target.value) || 0 })}
          className={walletErrors.some((e) => e.field === 'amount') ? COLORS.status.error.border : ''}
        />
      </div>

      {/* Strategy Allocation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm">Strategy Allocation</label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePreset('normalize')}
              className="text-sm px-3 py-1.5"
            >
              Normalize
            </Button>
            <Badge variant={isStrategyValid ? 'default' : 'destructive'}>
              {totalStrategyPercentage.toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePreset('equal-split')}
            className="flex-1"
          >
            Equal Split
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePreset('defi-focused')}
            className="flex-1"
          >
            DeFi Focused
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePreset('direct-only')}
            className="flex-1"
          >
            Direct Only
          </Button>
        </div>

        {/* Strategy Configuration */}
        <div className="space-y-4">
          {wallet.strategies.map((strategy, idx) => (
            <StrategyRow
              key={idx}
              strategy={strategy}
              onChange={(percentage) => handleStrategyChange(idx, percentage)}
              walletColor={wallet.color}
            />
          ))}
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