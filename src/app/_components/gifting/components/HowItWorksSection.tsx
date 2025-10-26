import React from 'react';
import { Coins, Clock, Users, Settings, Play, CheckCircle } from 'lucide-react';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../design-tokens';

export const HowItWorksSteps: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Step 1 */}
      <div className={`p-4 ${COLORS.backgroundSecondary} border ${COLORS.borderPrimary} rounded-lg`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center justify-center w-8 h-8 ${COLORS.brand.recipientPrimary.background} ${COLORS.brand.recipientPrimary.border} border rounded-full`}>
            <span className={`${COLORS.brand.recipientPrimary.text} ${FONT_SIZES.bodySmall} ${FONT_WEIGHTS.sectionHeading}`}>1</span>
          </div>
          <Users className={`h-5 w-5 ${COLORS.brand.iconPrimary}`} />
          <span className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.sectionHeading}`}>Set Up Recipients</span>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Add up to 20 recipients and configure their individual settings
        </p>
        <ul className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} space-y-1 ml-4`}>
          <li>• Enter recipient wallet addresses</li>
          <li>• Set percentage allocation per recipient</li>
          <li>• Choose DeFi strategy per recipient</li>
        </ul>
      </div>

      {/* Step 2 */}
      <div className={`p-4 ${COLORS.backgroundSecondary} border ${COLORS.borderPrimary} rounded-lg`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center justify-center w-8 h-8 ${COLORS.brand.recipientPrimary.background} ${COLORS.brand.recipientPrimary.border} border rounded-full`}>
            <span className={`${COLORS.brand.recipientPrimary.text} ${FONT_SIZES.bodySmall} ${FONT_WEIGHTS.sectionHeading}`}>2</span>
          </div>
          <Settings className={`h-5 w-5 ${COLORS.brand.iconPrimary}`} />
          <span className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.sectionHeading}`}>Configure Strategies</span>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Select from 4 DeFi strategies for each recipient's allocation
        </p>
        <ul className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} space-y-1 ml-4`}>
          <li>• Direct Transfer: Send USDC directly</li>
          <li>• AAVE Supply: Earn interest via AAVE</li>
          <li>• Morpho Deposit: Optimized yield farming</li>
          <li>• Uniswap Swap: Convert USDC to WETH</li>
        </ul>
      </div>

      {/* Step 3 */}
      <div className={`p-4 ${COLORS.backgroundSecondary} border ${COLORS.borderPrimary} rounded-lg`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center justify-center w-8 h-8 ${COLORS.brand.recipientPrimary.background} ${COLORS.brand.recipientPrimary.border} border rounded-full`}>
            <span className={`${COLORS.brand.recipientPrimary.text} ${FONT_SIZES.bodySmall} ${FONT_WEIGHTS.sectionHeading}`}>3</span>
          </div>
          <Coins className={`h-5 w-5 ${COLORS.brand.iconPrimary}`} />
          <span className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.sectionHeading}`}>Set Percentages</span>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Set percentage allocations and choose DeFi strategies for each recipient
        </p>
        <ul className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} space-y-1 ml-4`}>
          <li>• Total must equal 100% across all recipients</li>
          <li>• Each recipient gets one DeFi strategy</li>
          <li>• Choose from 4 different DeFi strategies</li>
        </ul>
      </div>

      {/* Step 4 */}
      <div className={`p-4 ${COLORS.backgroundSecondary} border ${COLORS.borderPrimary} rounded-lg`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center justify-center w-8 h-8 ${COLORS.brand.recipientPrimary.background} ${COLORS.brand.recipientPrimary.border} border rounded-full`}>
            <span className={`${COLORS.brand.recipientPrimary.text} ${FONT_SIZES.bodySmall} ${FONT_WEIGHTS.sectionHeading}`}>4</span>
          </div>
          <Play className={`h-5 w-5 ${COLORS.brand.iconPrimary}`} />
          <span className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.sectionHeading}`}>Execute Distribution</span>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Review settings and execute the gift distribution
        </p>
        <ul className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} space-y-1 ml-4`}>
          <li>• Verify all addresses and percentages</li>
          <li>• Connect wallet and approve transaction</li>
          <li>• Monitor execution via blockchain</li>
        </ul>
      </div>

      {/* Quick Tips */}
      <div className={`p-4 ${COLORS.status.info.background} ${COLORS.status.info.border} border rounded-lg`}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className={`h-4 w-4 ${COLORS.brand.iconPrimary}`} />
          <span className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.sectionHeading}`}>Quick Tips</span>
        </div>
        <ul className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} space-y-1 ml-4`}>
          <li>• Save configurations using ConfigManager for reuse</li>
          <li>• Test with small amounts first on testnets</li>
          <li>• Monitor gas fees for optimal execution timing</li>
          <li>• Use different strategies to optimize yield</li>
        </ul>
      </div>
    </div>
  );
};
