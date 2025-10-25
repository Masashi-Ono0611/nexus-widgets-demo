import React from 'react';
import { RecipientWallet } from '../types';
import { calculateTotalAmount, calculateTotalPercentage, formatUSDC } from '../utils';
import { Card } from '../../ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, getStrategyShade, lighten } from '../design-tokens';
import { STRATEGY_LABELS } from '../types';

interface TotalsSummaryProps {
  recipientWallets: RecipientWallet[];
}

export const TotalsSummary: React.FC<TotalsSummaryProps> = ({ recipientWallets }) => {
  const totalAmount = calculateTotalAmount(recipientWallets);
  const totalPercentage = calculateTotalPercentage(recipientWallets);

  return (
    <Card className="p-8 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Total Distribution</h3>
          <div className="flex justify-end items-baseline gap-1">
            <span className="text-sm">Total Amount:  </span>
            <span className="text-2xl font-bold">{formatUSDC(totalAmount)}</span>
          </div>
        </div>

        {/* Progress bar showing wallet allocations */}
        <div className="space-y-2">
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            {recipientWallets.map((wallet, rIdx) => {
              const percentage = (calculateTotalAmount(recipientWallets) > 0 ? (wallet.amount / calculateTotalAmount(recipientWallets)) * 100 : 0);
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
              const percentage = (calculateTotalAmount(recipientWallets) > 0 ? (wallet.amount / calculateTotalAmount(recipientWallets)) * 100 : 0);
              return (
                <div key={wallet.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: wallet.color }}
                    />
                    <span className={`${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label} ${COLORS.textPrimary}`}>
                      Recipient {index + 1}: {wallet.amount.toFixed(1)} USDC ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  {/* Strategy sub-legend */}
                  <div className="ml-5 flex flex-col gap-1">
                    {wallet.strategies.map((strategy, idx) => {
                      const shade = getStrategyShade(wallet.color, strategy.strategyEnum);

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: shade }}
                          />
                          <span className={`${FONT_SIZES.bodySmall} ${COLORS.textSecondary}`}>
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
    </Card>
  );
};