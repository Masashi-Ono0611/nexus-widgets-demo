import React from 'react';
import { RecipientWallet } from '../types';
import { calculateTotalPercentage } from '../utils';
import { Card } from '../../ui/card';
import { STRATEGY_LABELS } from '../types';
import { COLORS } from '../design-tokens';

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(Math.max(0, Math.min(255, Math.round(r))))}${toHex(Math.max(0, Math.min(255, Math.round(g))))}${toHex(Math.max(0, Math.min(255, Math.round(b))))}`;
}

function lighten(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => c + (255 - c) * amount;
  return rgbToHex(mix(r), mix(g), mix(b));
}

function getStrategyShade(baseHex: string, strategyIndex: number) {
  const factors = [0.15, 0.35, 0.55, 0.75];
  const idx = Math.max(0, Math.min(factors.length - 1, strategyIndex));
  return lighten(baseHex, factors[idx]);
}

interface TotalsSummaryProps {
  recipientWallets: RecipientWallet[];
}

export const TotalsSummary: React.FC<TotalsSummaryProps> = ({ recipientWallets }) => {
  const totalPercentage = calculateTotalPercentage(recipientWallets);

  return (
    <Card className="p-8 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Total Distribution</h3>
        </div>

        {/* Progress bar showing wallet allocations */}
        <div className="space-y-2">
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            {recipientWallets.map((wallet, rIdx) => {
              const percentage = wallet.sharePercent;
              if (percentage === 0) return null;

              return (
                <div
                  key={wallet.id}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: lighten(wallet.color, 0.85),
                    borderRight: rIdx < recipientWallets.length - 1 ? '2px solid #ffffff' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                  className="transition-all duration-300 hover:opacity-80"
                  title={`Recipient ${recipientWallets.indexOf(wallet) + 1}: ${percentage.toFixed(1)}%`}
                >
                  {/* Strategy sub-bars */}
                  <div className="flex h-full w-full">
                    {wallet.strategies.map((strategy, idx) => {
                      if (strategy.percentage === 0) return null;

                      const strategyWidth = `${strategy.percentage}%`;
                      const shade = getStrategyShade(wallet.color, strategy.strategyEnum);

                      return (
                        <div
                          key={idx}
                          style={{
                            width: strategyWidth,
                            backgroundColor: shade,
                            height: '100%',
                          }}
                          className="transition-all duration-300"
                          title={`${strategy.name}: ${strategy.percentage.toFixed(1)}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {recipientWallets.map((wallet, index) => {
              const percentage = wallet.sharePercent;
              return (
                <div key={wallet.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: wallet.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Recipient {index + 1}: {percentage.toFixed(1)}%
                    </span>
                  </div>
                  {/* Strategy sub-legend */}
                  <div className="ml-5 flex flex-wrap gap-2">
                    {wallet.strategies.map((strategy, idx) => {
                      if (strategy.percentage === 0) return null;
                      const shade = getStrategyShade(wallet.color, strategy.strategyEnum);

                      return (
                        <div key={idx} className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: shade }}
                          />
                          <span className="text-xs text-gray-600">
                            {STRATEGY_LABELS[strategy.strategyEnum]}: {strategy.percentage.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {Math.abs(totalPercentage - 100) > 0.01 && (
          <div
            className={`${COLORS.status.error.text} ${COLORS.status.error.background} ${COLORS.status.error.border} px-3 py-2 rounded flex items-center gap-2`}
          >
            <span className="font-medium">Share total must be 100%.</span>
            <span className="ml-auto text-sm">Current: {totalPercentage.toFixed(1)}%</span>
          </div>
        )}
    </Card>
  );
};