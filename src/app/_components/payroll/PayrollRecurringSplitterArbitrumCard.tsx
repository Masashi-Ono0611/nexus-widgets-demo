"use client";
import React, { useMemo, useState } from "react";
import { BridgeAndExecuteButton, TOKEN_CONTRACT_ADDRESSES, TOKEN_METADATA } from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";
import {
  DeFiStrategy,
  WalletGroup,
  StrategyAllocation,
  RECURRING_SPLITTER_ADDRESS,
  FLEXIBLE_SPLITTER_ADDRESS,
} from "./types";
import {
  isValidAddress,
  toContractRecipients,
  totalShare,
  sumPercent,
  buildFlatRecipientsFromGroups,
} from "./utils";
import { TotalsSummary } from "./components/TotalsSummary";
import { WalletCard } from "./components/WalletCard";
import { ExecutionModeCard } from "./components/ExecutionModeCard";
import { ValidationMessages } from "./components/ValidationMessages";

export function PayrollRecurringSplitterArbitrumCard() {
  const [walletGroups, setWalletGroups] = useState<WalletGroup[]>([
    {
      wallet: "",
      walletAmount: "",
      strategies: [
        { strategy: DeFiStrategy.DIRECT_TRANSFER, subPercent: "60" },
        { strategy: DeFiStrategy.AAVE_SUPPLY, subPercent: "30" },
        { strategy: DeFiStrategy.MORPHO_DEPOSIT, subPercent: "10" },
        { strategy: DeFiStrategy.UNISWAP_V2_SWAP, subPercent: "0" },
      ],
    },
  ]);

  const [intervalMinutes, setIntervalMinutes] = useState("60");
  const [maxExecutions, setMaxExecutions] = useState("3");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  const addWalletGroup = () => {
    if (walletGroups.length >= 5) {
      alert("Maximum 5 wallets allowed");
      return;
    }
    setWalletGroups([
      ...walletGroups,
      {
        wallet: "",
        walletAmount: "",
        strategies: [
          { strategy: DeFiStrategy.DIRECT_TRANSFER, subPercent: "100" },
          { strategy: DeFiStrategy.AAVE_SUPPLY, subPercent: "0" },
          { strategy: DeFiStrategy.MORPHO_DEPOSIT, subPercent: "0" },
          { strategy: DeFiStrategy.UNISWAP_V2_SWAP, subPercent: "0" },
        ],
      },
    ]);
  };

  const removeWalletGroup = (index: number) => {
    if (walletGroups.length <= 1) {
      alert("At least one wallet required");
      return;
    }
    setWalletGroups(walletGroups.filter((_, i) => i !== index));
  };

  const updateWalletField = (index: number, field: keyof WalletGroup, value: string) => {
    const updated = [...walletGroups];
    (updated[index] as any)[field] = value;
    setWalletGroups(updated);
  };

  const updateStrategyField = (
    walletIndex: number,
    strategyIndex: number,
    field: keyof StrategyAllocation,
    value: string | DeFiStrategy
  ) => {
    const updated = [...walletGroups];
    if (field === "strategy") {
      updated[walletIndex].strategies[strategyIndex][field] = value as DeFiStrategy;
    } else {
      updated[walletIndex].strategies[strategyIndex][field] = value as string;
    }
    setWalletGroups(updated);
  };

  const presetEvenSplit = (walletIndex: number) => {
    const updated = [...walletGroups];
    const n = updated[walletIndex].strategies.length;
    const base = Math.floor(10000 / n) / 100;
    const remainder = 100 - base * (n - 1);
    updated[walletIndex].strategies = updated[walletIndex].strategies.map((s, i) => ({
      ...s,
      subPercent: String(i === n - 1 ? remainder : base),
    }));
    setWalletGroups(updated);
  };

  const preset_60_30_10_0 = (walletIndex: number) => {
    const updated = [...walletGroups];
    const arr = [60, 30, 10, 0];
    updated[walletIndex].strategies = updated[walletIndex].strategies.map((s, i) => ({
      ...s,
      subPercent: String(arr[i] ?? 0),
    }));
    setWalletGroups(updated);
  };

  const normalizeStrategies = (walletIndex: number) => {
    const updated = [...walletGroups];
    const sum = updated[walletIndex].strategies.reduce((s, x) => s + (parseFloat(x.subPercent) || 0), 0);
    if (sum <= 0) {
      presetEvenSplit(walletIndex);
      return;
    }
    updated[walletIndex].strategies = updated[walletIndex].strategies.map((s) => ({
      ...s,
      subPercent: String(((parseFloat(s.subPercent) || 0) / sum) * 100),
    }));
    setWalletGroups(updated);
  };

  const totalAmountComputed = useMemo(
    () => walletGroups.reduce((s, g) => s + (parseFloat(g.walletAmount) || 0), 0),
    [walletGroups]
  );
  const totalWalletPercent = useMemo(() => {
    return totalAmountComputed > 0
      ? walletGroups.reduce((s, g) => s + ((parseFloat(g.walletAmount) || 0) / totalAmountComputed) * 100, 0)
      : 0;
  }, [walletGroups, totalAmountComputed]);
  const flatRecipients = useMemo(
    () => buildFlatRecipientsFromGroups(walletGroups, totalAmountComputed),
    [walletGroups, totalAmountComputed]
  );
  const totalShareValue = useMemo(() => totalShare(flatRecipients), [flatRecipients]);

  const prefillConfig = useMemo(() => {
    const base = { toChainId: 421614 as const, token: "USDC" as const };
    if (totalAmountComputed && totalAmountComputed > 0) {
      return { ...base, amount: String(totalAmountComputed) };
    }
    return base;
  }, [totalAmountComputed]);

  const isValidConfiguration = () => {
    const recipientsOk = walletGroups.every((g) => isValidAddress(g.wallet));
    const shareOk = Math.abs(totalShareValue - 100) < 0.01;
    const walletsTotalOk = Math.abs(totalWalletPercent - 100) < 0.01;
    const eachWalletOk = walletGroups.every(
      (g) => Math.abs(sumPercent(g.strategies.map((s) => s.subPercent)) - 100) < 0.01
    );
    const recipientCountOk = flatRecipients.length <= 20;
    if (!scheduleEnabled) return recipientsOk && shareOk && walletsTotalOk && eachWalletOk && recipientCountOk;
    const interval = parseInt(intervalMinutes);
    const maxExec = parseInt(maxExecutions);
    const validInterval = interval >= 1 && interval <= 525600;
    const validMaxExecutions = maxExec >= 0 && maxExec <= 1000;
    return recipientsOk && shareOk && walletsTotalOk && eachWalletOk && recipientCountOk && validInterval && validMaxExecutions;
  };

  const validationMessages: string[] = [];
  if (totalAmountComputed <= 0) validationMessages.push("Enter wallet amounts (USDC) to compute total");
  if (Math.abs(totalWalletPercent - 100) >= 0.01) validationMessages.push("Wallets Total must be 100%");
  walletGroups.forEach((g, i) => {
    const s = sumPercent(g.strategies.map((x) => x.subPercent));
    if (Math.abs(s - 100) >= 0.01) validationMessages.push(`Wallet ${i + 1}: Strategies Total must be 100%`);
    if (!isValidAddress(g.wallet)) validationMessages.push(`Wallet ${i + 1}: Invalid address`);
  });
  if (flatRecipients.length > 20) validationMessages.push("Recipients exceed 20");

  return (
    <div className="card">
      <h3>Recurring Token Splitter (Arbitrum Sepolia) 🔄</h3>

      <TotalsSummary
        totalAmountComputed={totalAmountComputed}
        totalShareValue={totalShareValue}
        walletGroups={walletGroups}
      />

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <strong>Wallet Allocations ({walletGroups.length}/5)</strong>
        </div>
        {walletGroups.map((g, gi) => (
          <WalletCard
            key={gi}
            wallet={g}
            index={gi}
            totalAmountComputed={totalAmountComputed}
            canRemove={walletGroups.length > 1}
            onRemove={() => removeWalletGroup(gi)}
            onUpdateWallet={(field, value) => updateWalletField(gi, field, value)}
            onUpdateStrategy={(si, field, value) => updateStrategyField(gi, si, field, value)}
            onPresetEvenSplit={() => presetEvenSplit(gi)}
            onPreset_60_30_10_0={() => preset_60_30_10_0(gi)}
            onNormalize={() => normalizeStrategies(gi)}
          />
        ))}

        <button
          onClick={addWalletGroup}
          disabled={walletGroups.length >= 5 || flatRecipients.length >= 20}
          className="btn"
          style={{
            width: "100%",
            marginTop: "0.5rem",
            background: "#4CAF50",
            opacity: walletGroups.length >= 5 || flatRecipients.length >= 20 ? 0.6 : 1,
          }}
        >
          + Add Wallet
        </button>
      </div>

      <ExecutionModeCard
        scheduleEnabled={scheduleEnabled}
        setScheduleEnabled={setScheduleEnabled}
        intervalMinutes={intervalMinutes}
        setIntervalMinutes={setIntervalMinutes}
        maxExecutions={maxExecutions}
        setMaxExecutions={setMaxExecutions}
      />

      <BridgeAndExecuteButton
        contractAddress={scheduleEnabled ? RECURRING_SPLITTER_ADDRESS : FLEXIBLE_SPLITTER_ADDRESS}
        contractAbi={
          scheduleEnabled
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
        functionName={scheduleEnabled ? "createSchedule" : "distributeTokens"}
        prefill={prefillConfig}
        buildFunctionParams={(token, amount, chainId, userAddress) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const totalAmountWei = parseUnits(amount, decimals);
          const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];

          const maxExec = parseInt(maxExecutions);
          const amountPerExecution = maxExec > 0 ? totalAmountWei / BigInt(maxExec) : totalAmountWei;
          const contractRecipients = toContractRecipients(flatRecipients);

          if (!scheduleEnabled) {
            return {
              functionParams: [tokenAddress, totalAmountWei, contractRecipients],
            };
          }

          const intervalSeconds = parseInt(intervalMinutes) * 60;
          return {
            functionParams: [tokenAddress, amountPerExecution, contractRecipients, intervalSeconds, maxExec],
          };
        }}
      >
        {({ onClick, isLoading }) => (
          <button
            onClick={async () => {
              if (!isValidConfiguration()) {
                alert("Please ensure all addresses are valid, total share is 100%, and interval/executions are valid");
                return;
              }
              await onClick();
            }}
            disabled={isLoading || !isValidConfiguration()}
            className="btn btn-primary"
          >
            {isLoading ? "Processing…" : scheduleEnabled ? "Create Recurring Schedule" : "Execute Now"}
          </button>
        )}
      </BridgeAndExecuteButton>

      <ValidationMessages messages={validationMessages} />
    </div>
  );
}
