import React from 'react';
import { RecipientWallet } from './types';
import { calculateTotalAmount, calculateWalletPercentages, formatUSDC } from './utils';

interface TotalsSummaryProps {
  recipientWallets: RecipientWallet[];
}

export const TotalsSummary: React.FC<TotalsSummaryProps> = ({ recipientWallets }) => {
  const totalAmount = calculateTotalAmount(recipientWallets);
  const percentages = calculateWalletPercentages(recipientWallets);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg">Total Distribution</h3>
        <div className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {formatUSDC(totalAmount)}
        </div>
      </div>

      {/* Progress bar showing wallet allocations */}
      <div className="space-y-2">
        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {recipientWallets.map((wallet) => {
            const percentage = percentages[wallet.id];
            if (percentage === 0) return null;

            return (
              <div
                key={wallet.id}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: wallet.color,
                }}
                className="transition-all duration-300 hover:opacity-80"
                title={`Recipient ${recipientWallets.indexOf(wallet) + 1}: ${percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {recipientWallets.map((wallet, index) => {
            const percentage = percentages[wallet.id];
            return (
              <div key={wallet.id} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: wallet.color }}
                />
                <span className="text-sm text-gray-600">
                  Recipient {index + 1}: {wallet.amount.toFixed(1)} USDC ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};