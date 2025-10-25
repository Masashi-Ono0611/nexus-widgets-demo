import React from 'react';
import { RecipientWallet } from '../types';
import { calculateTotalPercentage } from '../utils';
import { Card } from '../../ui/card';
import { STRATEGY_LABELS, STRATEGY_COLORS } from '../types';

interface TotalsSummaryProps {
  recipientWallets: RecipientWallet[];
}

export const TotalsSummary: React.FC<TotalsSummaryProps> = ({ recipientWallets }) => {
  const totalPercentage = calculateTotalPercentage(recipientWallets);

  return (
    <Card className="p-8 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Total Distribution</h3>
          <div className="flex justify-end items-baseline gap-1">
            <span className="text-sm">Total Percentage:  </span>
            <span className="text-2xl font-bold">{totalPercentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Progress bar showing wallet allocations */}
        <div className="space-y-2">
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            {recipientWallets.map((wallet) => {
              const percentage = wallet.sharePercent;
              if (percentage === 0) return null;

              return (
                <div
                  key={wallet.id}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: wallet.color + '20', // Light background for wallet
                    border: `2px solid ${wallet.color}`,
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

                      return (
                        <div
                          key={idx}
                          style={{
                            width: strategyWidth,
                            backgroundColor: strategy.color,
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

                      return (
                        <div key={idx} className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: strategy.color }}
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
    </Card>
  );
};