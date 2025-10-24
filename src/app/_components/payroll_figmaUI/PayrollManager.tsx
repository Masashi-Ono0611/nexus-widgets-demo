"use client";
import React, { useState, useMemo } from 'react';
import { BridgeAndExecuteButton, TOKEN_CONTRACT_ADDRESSES, TOKEN_METADATA } from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TotalsSummary } from './components/TotalsSummary';
import { WalletCard } from './components/WalletCard';
import { ExecutionModeCard } from './components/ExecutionModeCard';
import { ConfigManager } from './components/ConfigManager';
import { 
  RecipientWallet, 
  PayrollConfig, 
  STRATEGY_TEMPLATES, 
  WALLET_COLORS,
  RECURRING_SPLITTER_ADDRESS,
  FLEXIBLE_SPLITTER_ADDRESS,
  WalletGroup,
  STRATEGY_LABELS,
  STRATEGY_COLORS,
  DeFiStrategy,
} from './types';
import { 
  validateRecipientWallets, 
  calculateTotalAmount,
  convertToWalletGroups,
  buildFlatRecipientsFromWallets,
  toContractRecipients,
  totalShare,
  sumPercent,
} from './utils';
import { Plus, Settings, Play } from 'lucide-react';
import { toast } from 'sonner';
import { COLORS } from './design-tokens';

export const PayrollManager: React.FC = () => {
  const [recipientWallets, setRecipientWallets] = useState<RecipientWallet[]>([
    {
      id: '1',
      address: '',
      amount: 0,
      color: WALLET_COLORS[0],
      strategies: STRATEGY_TEMPLATES.map(s => ({ ...s, percentage: 25 })),
    },
  ]);

  const [executionMode, setExecutionMode] = useState<'immediate' | 'recurring'>('immediate');
  const [recurringInterval, setRecurringInterval] = useState(60);
  const [maxExecutions, setMaxExecutions] = useState(0);

  const errors = useMemo(() => validateRecipientWallets(recipientWallets), [recipientWallets]);
  const totalAmount = useMemo(() => calculateTotalAmount(recipientWallets), [recipientWallets]);
  
  // Convert to contract-compatible format
  const walletGroups = useMemo(() => convertToWalletGroups(recipientWallets), [recipientWallets]);
  const flatRecipients = useMemo(() => buildFlatRecipientsFromWallets(recipientWallets), [recipientWallets]);
  const totalShareValue = useMemo(() => totalShare(flatRecipients), [flatRecipients]);
  
  // Validation
  const isValid = useMemo(() => {
    const recipientsOk = recipientWallets.every((w) => w.address && w.address.startsWith('0x') && w.address.length === 42);
    const shareOk = Math.abs(totalShareValue - 100) < 0.01;
    const recipientCountOk = flatRecipients.length <= 20;
    const amountOk = totalAmount > 0;
    
    if (!executionMode || executionMode === 'immediate') {
      return recipientsOk && shareOk && recipientCountOk && amountOk;
    }
    
    const validInterval = recurringInterval >= 1 && recurringInterval <= 525600;
    const validMaxExecutions = maxExecutions >= 0 && maxExecutions <= 1000;
    return recipientsOk && shareOk && recipientCountOk && amountOk && validInterval && validMaxExecutions;
  }, [recipientWallets, totalShareValue, flatRecipients, totalAmount, executionMode, recurringInterval, maxExecutions]);
  
  const prefillConfig = useMemo(() => {
    const base = { toChainId: 421614 as const, token: "USDC" as const };
    if (totalAmount && totalAmount > 0) {
      return { ...base, amount: String(totalAmount) };
    }
    return base;
  }, [totalAmount]);

  const handleAddWallet = () => {
    if (recipientWallets.length >= 5) {
      toast.error('Maximum 5 recipient wallets allowed');
      return;
    }

    const newWallet: RecipientWallet = {
      id: Date.now().toString(),
      address: '',
      amount: 0,
      color: WALLET_COLORS[recipientWallets.length % WALLET_COLORS.length],
      strategies: STRATEGY_TEMPLATES.map(s => ({ ...s })),
    };

    setRecipientWallets([...recipientWallets, newWallet]);
    toast.success('Recipient wallet added');
  };

  const handleRemoveWallet = (id: string) => {
    if (recipientWallets.length <= 1) {
      toast.error('At least one recipient wallet is required');
      return;
    }

    setRecipientWallets(recipientWallets.filter(w => w.id !== id));
    toast.success('Recipient wallet removed');
  };

  const handleWalletChange = (id: string, updatedWallet: RecipientWallet) => {
    setRecipientWallets(recipientWallets.map(w => (w.id === id ? updatedWallet : w)));
  };

  const handleLoadConfig = (
    loadedWalletGroups: WalletGroup[],
    loadedIntervalMinutes: string,
    loadedMaxExecutions: string,
    loadedScheduleEnabled: boolean
  ) => {
    // Convert WalletGroup[] back to RecipientWallet[]
    const loadedRecipients: RecipientWallet[] = loadedWalletGroups.map((group, index) => ({
      id: Date.now().toString() + index,
      address: group.wallet,
      amount: parseFloat(group.walletAmount),
      color: WALLET_COLORS[index % WALLET_COLORS.length],
      strategies: group.strategies.map((s) => {
        // Convert strategy enum to number if it's BigInt
        const strategyNum = typeof s.strategy === 'bigint' ? Number(s.strategy) : Number(s.strategy);

        // Use STRATEGY_LABELS and STRATEGY_COLORS for direct mapping
        const strategyName = STRATEGY_LABELS[strategyNum] || 'Unknown';
        const strategyColor = STRATEGY_COLORS[strategyNum] || '#999';

        return {
          name: strategyName,
          percentage: parseFloat(s.subPercent),
          color: strategyColor,
          address: '0x0', // Not needed for loaded configs
          strategyEnum: strategyNum as DeFiStrategy,
        };
      }),
    }));

    setRecipientWallets(loadedRecipients);
    setRecurringInterval(parseInt(loadedIntervalMinutes) || 60);
    setMaxExecutions(parseInt(loadedMaxExecutions) || 0);
    setExecutionMode(loadedScheduleEnabled ? 'recurring' : 'immediate');
  };

  return (
    <div className="space-y-4">
      {/* Configuration Management */}
      <div className="flex justify-end mb-2">
        <ConfigManager
          walletGroups={walletGroups}
          intervalMinutes={String(recurringInterval)}
          maxExecutions={String(maxExecutions)}
          scheduleEnabled={executionMode === 'recurring'}
          onLoadConfig={handleLoadConfig}
        />
      </div>
      {/* Recipient Wallets */}
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

        {/* Add Wallet Button */}
        {recipientWallets.length < 5 && (
          <Button
            variant="outline"
            onClick={handleAddWallet}
            className="w-full border-dashed border-2 h-16 hover:bg-blue-50 hover:border-blue-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Recipient Wallet ({recipientWallets.length}/5)
          </Button>
        )}
      </div>

      {/* Execution Mode */}
      <ExecutionModeCard
        mode={executionMode}
        onModeChange={setExecutionMode}
        recurringInterval={recurringInterval}
        maxExecutions={maxExecutions}
        onRecurringIntervalChange={setRecurringInterval}
        onMaxExecutionsChange={setMaxExecutions}
      />

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

      {/* Execute Button */}
      <Card className="p-6">
        <div className="space-y-4">
          {isValid ? (
            <div></div>
          ) : (
            <div className={`flex items-center gap-2 ${COLORS.status.error.text} p-3 ${COLORS.status.error.background} rounded-lg`}>
              <Settings className="h-4 w-4" />
              <span className="font-medium">Configuration incomplete - please fill all fields</span>
            </div>
          )}

          <BridgeAndExecuteButton
            contractAddress={executionMode === 'recurring' ? RECURRING_SPLITTER_ADDRESS : FLEXIBLE_SPLITTER_ADDRESS}
            contractAbi={
              executionMode === 'recurring'
                ? ([
                    {
                      name: "createSchedule",
                      type: "function",
                      stateMutability: "nonpayable",
                      inputs: [
                        { name: "asset", type: "address" },
                        { name: "amountPerExecution", type: "uint256" },
                        {
                          name: "recipients",
                          type: "tuple[]",
                          components: [
                            { name: "wallet", type: "address" },
                            { name: "sharePercent", type: "uint16" },
                            { name: "strategy", type: "uint8" },
                          ],
                        },
                        { name: "intervalSeconds", type: "uint256" },
                        { name: "maxExecutions", type: "uint256" },
                      ],
                      outputs: [{ name: "scheduleId", type: "uint256" }],
                    },
                  ] as const)
                : ([
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
                  ] as const)
            }
            functionName={executionMode === 'recurring' ? "createSchedule" : "distributeTokens"}
            prefill={prefillConfig}
            buildFunctionParams={(token, amount, chainId, userAddress) => {
              const decimals = TOKEN_METADATA[token].decimals;
              const totalAmountWei = parseUnits(amount, decimals);
              const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];

              const contractRecipients = toContractRecipients(flatRecipients);

              if (executionMode !== 'recurring') {
                return {
                  functionParams: [tokenAddress, totalAmountWei, contractRecipients],
                };
              }

              const maxExec = maxExecutions;
              const amountPerExecution = maxExec > 0 ? totalAmountWei / BigInt(maxExec) : totalAmountWei;
              const intervalSeconds = recurringInterval * 60;
              return {
                functionParams: [tokenAddress, amountPerExecution, contractRecipients, intervalSeconds, maxExec],
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
                className="w-full h-16 text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Play className="h-6 w-6 mr-3" />
                {isLoading ? 'Processing...' : executionMode === 'recurring' ? 'Schedule Recurring Payroll' : 'Execute Payroll Now'}
              </Button>
            )}
          </BridgeAndExecuteButton>
        </div>
      </Card>
    </div>
  );
};