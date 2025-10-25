import React from 'react';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../design-tokens';

export const DeFiStrategiesSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={`p-4 ${COLORS.status.success.background} ${COLORS.status.success.border} border rounded-lg`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${COLORS.status.success.text.replace('text-', 'bg-')}`}></div>
          <span className={`${COLORS.status.success.text} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            Direct Transfer
          </span>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Send USDC directly to recipient wallets
        </p>
        <p className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall}`}>
          No smart contract interaction required
        </p>
      </div>

      <div className={`p-4 ${COLORS.status.info.background} ${COLORS.status.info.border} border rounded-lg`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${COLORS.status.info.text.replace('text-', 'bg-')}`}></div>
          <span className={`${COLORS.status.info.text} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            AAVE Supply
          </span>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Supply USDC to AAVE protocol to earn interest
        </p>
        <p className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall}`}>
          Connected to: AAVE Pool
        </p>
        <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} ${COLORS.backgroundAccent} px-2 py-1 rounded`}>
          0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff
        </code>
      </div>

      <div className={`p-4 ${COLORS.brand.accent.background} ${COLORS.brand.accent.border} border rounded-lg`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${COLORS.brand.accent.text.replace('text-', 'bg-')}`}></div>
          <span className={`${COLORS.brand.accent.text} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            Morpho Deposit
          </span>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Deposit USDC to Morpho Vault for optimized yield
        </p>
        <p className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall}`}>
          Connected to: Morpho Vault v2
        </p>
        <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} ${COLORS.backgroundAccent} px-2 py-1 rounded`}>
          0xabf102Ed5f977331BdAD74d9136b6bFb7A2F09b6
        </code>
      </div>

      <div className={`p-4 ${COLORS.status.warning.background} ${COLORS.status.warning.border} border rounded-lg`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${COLORS.status.warning.text.replace('text-', 'bg-')}`}></div>
          <span className={`${COLORS.status.warning.text} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            Uniswap V2 Swap
          </span>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Swap USDC to WETH via Uniswap V2
        </p>
        <p className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall}`}>
          Connected to: Uniswap V2 Pair (USDC/WETH)
        </p>
        <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} ${COLORS.backgroundAccent} px-2 py-1 rounded`}>
          0x4F7392b66ADB7D09EdAe3C877714c5992Aeb4671
        </code>
      </div>
    </div>
  );
};
