import React from 'react';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../design-tokens';
import { CopyButton } from '../../ui/copy-button';

export const KeyContractsSection: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className={`p-4 ${COLORS.brand.secondary.background} ${COLORS.brand.secondary.border} border rounded-lg`}>
        <div className="mb-2">
          <h4 className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            FlexibleSplitter
          </h4>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Executes one-time gift distributions
        </p>
        <div className={`flex items-center justify-between gap-2 ${COLORS.backgroundAccent} p-2 rounded`}>
          <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} flex-1`}>
            0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454
          </code>
          <CopyButton text="0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454" />
        </div>
      </div>

      <div className={`p-4 ${COLORS.brand.secondary.background} ${COLORS.brand.secondary.border} border rounded-lg`}>
        <div className="mb-2">
          <h4 className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            RecurringSplitter
          </h4>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Executes scheduled recurring gift distributions
        </p>
        <div className={`flex items-center justify-between gap-2 ${COLORS.backgroundAccent} p-2 rounded`}>
          <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} flex-1`}>
            0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E
          </code>
          <CopyButton text="0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E" />
        </div>
      </div>

      <div className={`p-4 ${COLORS.brand.secondary.background} ${COLORS.brand.secondary.border} border rounded-lg`}>
        <div className="mb-2">
          <h4 className={`${COLORS.textPrimary} ${FONT_SIZES.bodyMedium} ${FONT_WEIGHTS.label}`}>
            GiftingConfigRegistry
          </h4>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          On-chain registry for saving and sharing gifting configurations
        </p>
        <div className={`flex items-center justify-between gap-2 ${COLORS.backgroundAccent} p-2 rounded`}>
          <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} flex-1`}>
            0x2e14Dc0A48F5d700695fc0c15b35bcf24761756F
          </code>
          <CopyButton text="0x2e14Dc0A48F5d700695fc0c15b35bcf24761756F" />
        </div>
      </div>
    </div>
  );
};
