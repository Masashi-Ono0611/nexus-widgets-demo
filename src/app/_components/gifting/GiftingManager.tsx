"use client";
import React, { useMemo } from 'react';
import { BridgeAndExecuteButton, TOKEN_CONTRACT_ADDRESSES, TOKEN_METADATA } from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { InfoAccordion } from './components/InfoAccordion';
import { TotalsSummary } from './components/TotalsSummary';
import { WalletCard } from './components/WalletCard';
import { ConfigManager } from './components/ConfigManager';
import {
  RecipientWallet,
  STRATEGY_TEMPLATES,
  WALLET_COLORS,
  RECURRING_SPLITTER_ADDRESS,
  FLEXIBLE_SPLITTER_ADDRESS,
  STRATEGY_LABELS,
  DeFiStrategy,
  Recipient,
} from './types';
import {
  validateRecipientWallets,
  convertToRecipients,
  calculateTotalPercentage,
} from './utils';
import { Plus, Settings, Play } from 'lucide-react';
import { toast } from 'sonner';
import { COLORS } from './design-tokens';
import { useGiftingConfig } from './hooks/useGiftingConfig';
import { Toaster } from 'sonner';

type GiftingManagerProps = {
  executeOnly?: boolean;
};

function GiftingManagerInner({ executeOnly }: GiftingManagerProps) {
  const {
    recipientWallets,
    setRecipientWallets,
    recipients,
    errors,
    isValid,
    prefillConfig,
    buildFunctionParams,
    onLoadConfig,
    currentId,
    isLoadingConfig,
    notFound,
    totalShareValue,
  } = useGiftingConfig();

  const handleAddWallet = () => {
    if (recipientWallets.length >= 5) {
      toast.error('Maximum 5 recipients allowed');
      return;
    }

    const remainingPercentage = 100 - recipientWallets.reduce((sum, w) => sum + w.sharePercent, 0);
    const newSharePercent = Math.max(0, remainingPercentage);

    const newWallet: RecipientWallet = {
      id: Date.now().toString(),
      address: '',
      sharePercent: newSharePercent,
      color: WALLET_COLORS[recipientWallets.length % WALLET_COLORS.length],
      strategies: STRATEGY_TEMPLATES,
    };

    setRecipientWallets([...recipientWallets, newWallet]);
    toast.success('Recipient added');
  };

  const handleRemoveWallet = (id: string) => {
    if (recipientWallets.length <= 1) {
      toast.error('At least one recipient is required');
      return;
    }

    setRecipientWallets(recipientWallets.filter(w => w.id !== id));
    toast.success('Recipient removed');
  };

  const handleWalletChange = (id: string, updatedWallet: RecipientWallet) => {
    setRecipientWallets(recipientWallets.map(w => (w.id === id ? updatedWallet : w)));
  };

  const handleLoadConfig = (loadedRecipients: Recipient[]) => {
    onLoadConfig(loadedRecipients);
    // Success message is now shown in ConfigManager.tsx to avoid duplicates
  };

  return (
    <div className="space-y-4">
      {/* ExecuteOnly mode: Show loading or error */}
      {executeOnly && isLoadingConfig && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      )}
      {executeOnly && !isLoadingConfig && notFound && (
        <div className="text-center py-4 text-red-600">Configuration not found{currentId ? ` (ID: ${currentId})` : ""}</div>
      )}

      {/* Hide everything while loading in ExecuteOnly mode */}
      {!(executeOnly && isLoadingConfig) && (
        <>
          {!executeOnly && (
            <>
              {/* Configuration Management */}
              <div className="flex justify-end mb-2">
                <ConfigManager
                  recipients={recipients}
                  onLoadConfig={handleLoadConfig}
                />
              </div>

              {/* Recipients */}
              <div className="space-y-2 mb-4">
                {recipientWallets.map((wallet, index) => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    index={index}
                    onChange={(updatedWallet: RecipientWallet) => handleWalletChange(wallet.id, updatedWallet)}
                    onRemove={() => handleRemoveWallet(wallet.id)}
                    errors={errors}
                    canRemove={recipientWallets.length > 1}
                  />
                ))}

                {/* Add Recipient Button */}
                {recipientWallets.length < 5 && (
                  <Button
                    variant="outline"
                    onClick={handleAddWallet}
                    className="w-full border-dashed border-2 h-16 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Recipient ({recipientWallets.length}/5)
                  </Button>
                )}
              </div>

              {/* Separator Line */}
              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-600 font-medium">Review & Execute</span>
                </div>
              </div>

              {/* Totals Summary */}
              <TotalsSummary recipientWallets={recipientWallets} />
            </>
          )}

          {/* Execute Button */}
          <Card className="p-6">
            <div className="space-y-4">
              <BridgeAndExecuteButton
                contractAddress={FLEXIBLE_SPLITTER_ADDRESS}
                contractAbi={[
                  {
                    name: "distributeTokens",
                    type: "function",
                    stateMutability: "nonpayable",
                    inputs: [
                      { name: "asset", type: "address" },
                      { name: "amount", type: "uint256" },
                      {
                        name: "recipients",
                        type: "tuple[]",
                        components: [
                          { name: "wallet", type: "address" },
                          { name: "sharePercent", type: "uint16" },
                          { name: "strategy", type: "uint8" },
                        ],
                      },
                    ],
                    outputs: [],
                  },
                ] as const}
                functionName="distributeTokens"
                prefill={prefillConfig}
                buildFunctionParams={(token, amount, chainId, userAddress) => {
                  const decimals = TOKEN_METADATA[token].decimals;
                  const totalAmountWei = parseUnits(amount, decimals);
                  const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];

                  const contractRecipients = recipients.map(r => ({
                    wallet: r.wallet as `0x${string}`,
                    sharePercent: Math.round(parseFloat(r.sharePercent) * 100),
                    strategy: r.strategy,
                  }));

                  return {
                    functionParams: [tokenAddress, totalAmountWei, contractRecipients],
                  };
                }}
              >
                {({ onClick, isLoading }) => (
                  <Button
                    onClick={async () => {
                      if (!isValid) {
                        toast.error('Please ensure all addresses are valid and total share is 100%');
                        return;
                      }
                      await onClick();
                    }}
                    disabled={isLoading || !isValid}
                    className={`w-full h-16 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                      isLoading || !isValid
                        ? `${COLORS.interactiveImportant.disabled}`
                        : `${COLORS.brand.recipientPrimaryImportant.background} ${COLORS.brand.recipientPrimaryImportant.text} ${COLORS.brand.recipientPrimaryImportant.border} ${COLORS.brand.recipientPrimaryImportant.hover} ${COLORS.brand.recipientPrimaryImportant.focus}`
                    }`}
                  >
                    <Play className="h-6 w-6 mr-3" />
                    {isLoading ? 'Processing...' : 'Execute Gift Distribution Now'}
                  </Button>
                )}
              </BridgeAndExecuteButton>

              {/* Config error banner below the button - only show in non-executeOnly mode */}
              {!executeOnly && !isValid && (
                <div className={`${COLORS.status.error.text} ${COLORS.status.error.background} ${COLORS.status.error.border} px-3 py-2 rounded flex items-center gap-2`}>
                  <span className="font-medium">Configuration incomplete - please follow the instructions above</span>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {!executeOnly && (
        <>
          {/* Separator Line */}
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-600 font-medium">How it works & Info</span>
            </div>
          </div>

          {/* Information Sections in Accordion */}
          <InfoAccordion />
        </>
      )}
    </div>
  );
}

export const GiftingManager: React.FC = () => {
  return (
    <>
      <Toaster
        position="top-right"
      />
      <GiftingManagerInner />
    </>
  );
};

export const GiftingManagerExecuteOnly: React.FC = () => {
  return (
    <>
      <Toaster
        position="top-right"
      />
      <GiftingManagerInner executeOnly />
    </>
  );
};