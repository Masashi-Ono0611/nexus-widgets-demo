import React from 'react';
import { Badge } from '../../ui/badge';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../design-tokens';

export const KeyContractsSection: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className={`p-4 ${COLORS.brand.secondary.background} ${COLORS.brand.secondary.border} border rounded-lg`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className={`${COLORS.textPrimary} ${FONT_SIZES.cardTitle} ${FONT_WEIGHTS.sectionHeading}`}>
            FlexibleSplitter
          </h4>
          <Badge variant="outline" className={`${COLORS.brand.secondary.text} border-current`}>
            One-time
          </Badge>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Executes one-time payroll distributions
        </p>
        <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} ${COLORS.backgroundAccent} p-2 rounded block`}>
          0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454
        </code>
      </div>

      <div className={`p-4 ${COLORS.brand.secondary.background} ${COLORS.brand.secondary.border} border rounded-lg`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className={`${COLORS.textPrimary} ${FONT_SIZES.cardTitle} ${FONT_WEIGHTS.sectionHeading}`}>
            RecurringSplitter
          </h4>
          <Badge variant="outline" className={`${COLORS.brand.accent.text} border-current`}>
            Recurring
          </Badge>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          Executes scheduled recurring payroll distributions
        </p>
        <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} ${COLORS.backgroundAccent} p-2 rounded block`}>
          0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E
        </code>
      </div>

      <div className={`p-4 ${COLORS.brand.secondary.background} ${COLORS.brand.secondary.border} border rounded-lg`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className={`${COLORS.textPrimary} ${FONT_SIZES.cardTitle} ${FONT_WEIGHTS.sectionHeading}`}>
            PayrollConfigRegistry
          </h4>
          <Badge variant="outline" className={`${COLORS.status.info.text} border-current`}>
            Config Storage
          </Badge>
        </div>
        <p className={`${COLORS.textSecondary} ${FONT_SIZES.bodySmall} mb-2`}>
          On-chain registry for saving and sharing payroll configurations
        </p>
        <code className={`${COLORS.textTertiary} ${FONT_SIZES.bodySmall} ${COLORS.backgroundAccent} p-2 rounded block`}>
          0x1d5dF7B4553c78318DB8F4833BD22fE92E32F2D7
        </code>
      </div>
    </div>
  );
};
