import React from 'react';
import { RecipientWallet, ValidationError } from '../types';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { StrategyRow } from './StrategyRow';
import { applyPreset, formatAddress } from '../utils';
import { Trash2, Wallet } from 'lucide-react';
import { Badge } from '../../ui/badge';

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
    <Card className="p-6 space-y-4 border-2 transition-all duration-200 hover:shadow-lg" style={{ borderColor: wallet.color }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: wallet.color + '20' }}
          >
            <Wallet className="h-5 w-5" style={{ color: wallet.color }} />
          </div>
          <div>
            <h3 className="font-semibold">Recipient Wallet {index + 1}</h3>
            {wallet.address && (
              <p className="text-sm text-gray-500">{formatAddress(wallet.address)}</p>
            )}
          </div>
        </div>
        {canRemove && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 border-red-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Wallet Address */}
      <div className="space-y-1">
        <label className="text-sm">Wallet Address</label>
        <Input
          placeholder="0x..."
          value={wallet.address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...wallet, address: e.target.value })}
          className={walletErrors.some((e) => e.field === 'address') ? 'border-red-500' : ''}
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
          className={walletErrors.some((e) => e.field === 'amount') ? 'border-red-500' : ''}
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
              className="text-xs px-3 py-1.5"
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
              className="text-sm text-red-600 bg-red-50 p-2 rounded"
            >
              {error.message}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};