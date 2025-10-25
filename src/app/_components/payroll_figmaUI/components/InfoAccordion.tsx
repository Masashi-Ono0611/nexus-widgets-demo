import React from 'react';
import { Info, Database, Coins } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../design-tokens';
import { HowItWorksSteps } from './HowItWorksSection';
import { KeyContractsSection } from './KeyContractsSection';
import { DeFiStrategiesSection } from './DeFiStrategiesSection';

export const InfoAccordion: React.FC = () => {
  return (
    <Accordion type="multiple" className="w-full space-y-2">
      <AccordionItem value="how-it-works" className="border border-gray-200 rounded-lg px-6">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <Info className={`h-5 w-5 ${COLORS.brand.primary.text}`} />
            <span className={`${COLORS.textPrimary} ${FONT_SIZES.sectionHeading}`}>How it works</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-0 pb-4">
          <HowItWorksSteps />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="key-contracts" className="border border-gray-200 rounded-lg px-6">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <Database className={`h-5 w-5 ${COLORS.brand.secondary.text}`} />
            <span className={`${COLORS.textPrimary} ${FONT_SIZES.sectionHeading}`}>Key Contracts</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-0 pb-4">
          <KeyContractsSection />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="defi-strategies" className="border border-gray-200 rounded-lg px-6">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <Coins className={`h-5 w-5 ${COLORS.brand.accent.text}`} />
            <span className={`${COLORS.textPrimary} ${FONT_SIZES.sectionHeading}`}>DeFi Strategies</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-0 pb-4">
          <DeFiStrategiesSection />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
