import React from 'react';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../design-tokens';
import { CopyButton } from '../../ui/copy-button';

export const DeFiStrategiesSection: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className={`p-4 ${COLORS.brand.secondary.background} ${COLORS.brand.secondary.border} border rounded-lg`}>
        <div className="mb-2">
          <h4 className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            Direct Transfer
          </h4>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Send USDC directly to recipient wallets
        </p>
        <p className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall}`}>
          No smart contract interaction required
        </p>
      </div>

      <div className={`p-4 ${COLORS.brand.secondary.background} ${COLORS.brand.secondary.border} border rounded-lg`}>
        <div className="mb-2">
          <h4 className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            AAVE Supply
          </h4>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Supply USDC to AAVE protocol to earn interest
        </p>
        <p className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall}`}>
          Connected to: AAVE Pool
        </p>
        <div className={`flex items-center justify-between gap-2 ${COLORS.backgroundAccent} p-2 rounded`}>
          <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} flex-1`}>
            0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff
          </code>
          <CopyButton text="0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff" />
        </div>
      </div>

      <div className={`p-4 ${COLORS.brand.secondary.background} ${COLORS.brand.secondary.border} border rounded-lg`}>
        <div className="mb-2">
          <h4 className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            Morpho Deposit
          </h4>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Deposit USDC to Morpho Vault for optimized yield
        </p>
        <p className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall}`}>
          Connected to: Morpho Vault v2
        </p>
        <div className={`flex items-center justify-between gap-2 ${COLORS.backgroundAccent} p-2 rounded`}>
          <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} flex-1`}>
            0xabf102Ed5f977331BdAD74d9136b6bFb7A2F09b6
          </code>
          <CopyButton text="0xabf102Ed5f977331BdAD74d9136b6bFb7A2F09b6" />
        </div>
      </div>

      <div className={`p-4 ${COLORS.brand.secondary.background} ${COLORS.brand.secondary.border} border rounded-lg`}>
        <div className="mb-2">
          <h4 className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            Uniswap V2 Swap
          </h4>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Swap USDC to WETH via Uniswap V2
        </p>
        <p className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall}`}>
          Connected to: Uniswap V2 Pair (USDC/WETH)
        </p>
        <div className={`flex items-center justify-between gap-2 ${COLORS.backgroundAccent} p-2 rounded`}>
          <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} flex-1`}>
            0x4F7392b66ADB7D09EdAe3C877714c5992Aeb4671
          </code>
          <CopyButton text="0x4F7392b66ADB7D09EdAe3C877714c5992Aeb4671" />
        </div>
      </div>
    </div>
  );
};

