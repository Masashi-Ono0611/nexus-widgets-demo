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
                    backgroundColor: STRATEGY_COLORS[wallet.strategy],
                  }}
                  className="transition-all duration-300 hover:opacity-80"
                  title={`Recipient ${recipientWallets.indexOf(wallet) + 1}: ${percentage.toFixed(1)}% - ${STRATEGY_LABELS[wallet.strategy]}`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {recipientWallets.map((wallet, index) => {
              const percentage = wallet.sharePercent;
              return (
                <div key={wallet.id} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: STRATEGY_COLORS[wallet.strategy] }}
                  />
                  <span className="text-sm text-gray-600">
                    Recipient {index + 1}: {percentage.toFixed(1)}% ({STRATEGY_LABELS[wallet.strategy]})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
    </Card>
  );
};