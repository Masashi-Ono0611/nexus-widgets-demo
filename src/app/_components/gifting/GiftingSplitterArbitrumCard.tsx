"use client";
import React, { useMemo, useState } from "react";
import { BridgeAndExecuteButton } from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";
import { DeFiStrategy, Recipient, RecipientGroup, StrategyAllocation, FLEXIBLE_SPLITTER_ADDRESS } from "./types";
import { isValidAddress, toContractRecipients, totalShare, sumPercent, buildFlatRecipientsFromGroups } from "./utils";
import { RecipientCard } from "./components/RecipientCard";
import { TotalsSummary } from "./components/TotalsSummary";
import { ValidationMessages } from "./components/ValidationMessages";
import { ConfigManager } from "./components/ConfigManager";
import { ToastProvider } from "../common/ToastProvider";

const FLEXIBLE_SPLITTER_ABI = [
  {
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
    name: "distributeTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

function GiftingSplitterArbitrumCardInner() {
  const [recipientGroups, setRecipientGroups] = useState<RecipientGroup[]>([
    {
      wallet: "",
      sharePercent: "100",
      strategies: [
        { strategy: DeFiStrategy.DIRECT_TRANSFER, subPercent: "100" },
        { strategy: DeFiStrategy.AAVE_SUPPLY, subPercent: "0" },
        { strategy: DeFiStrategy.MORPHO_DEPOSIT, subPercent: "0" },
        { strategy: DeFiStrategy.UNISWAP_V2_SWAP, subPercent: "0" },
      ],
    },
  ]);
  const [totalAmount, setTotalAmount] = useState("");

  const handleLoadConfig = (loadedRecipients: Recipient[]) => {
    // Convert flat recipients to RecipientGroups
    const groups: RecipientGroup[] = [];
    const walletMap = new Map<string, { sharePercent: number; strategies: Map<DeFiStrategy, number> }>();
    
    loadedRecipients.forEach(r => {
      const pct = parseFloat(r.sharePercent) || 0;
      if (!walletMap.has(r.wallet)) {
        walletMap.set(r.wallet, { sharePercent: 0, strategies: new Map() });
      }
      const entry = walletMap.get(r.wallet)!;
      entry.sharePercent += pct;
      entry.strategies.set(r.strategy, (entry.strategies.get(r.strategy) || 0) + pct);
    });
    
    walletMap.forEach((data, wallet) => {
      const strategies: StrategyAllocation[] = [
        { strategy: DeFiStrategy.DIRECT_TRANSFER, subPercent: "0" },
        { strategy: DeFiStrategy.AAVE_SUPPLY, subPercent: "0" },
        { strategy: DeFiStrategy.MORPHO_DEPOSIT, subPercent: "0" },
        { strategy: DeFiStrategy.UNISWAP_V2_SWAP, subPercent: "0" },
      ];
      
      data.strategies.forEach((pct, strategy) => {
        const subPct = data.sharePercent > 0 ? (pct / data.sharePercent) * 100 : 0;
        const idx = strategies.findIndex(s => s.strategy === strategy);
        if (idx >= 0) strategies[idx].subPercent = subPct.toString();
      });
      
      groups.push({ wallet, sharePercent: data.sharePercent.toString(), strategies });
    });
    
    setRecipientGroups(groups.length > 0 ? groups : [{
      wallet: "",
      sharePercent: "100",
      strategies: [
        { strategy: DeFiStrategy.DIRECT_TRANSFER, subPercent: "100" },
        { strategy: DeFiStrategy.AAVE_SUPPLY, subPercent: "0" },
        { strategy: DeFiStrategy.MORPHO_DEPOSIT, subPercent: "0" },
        { strategy: DeFiStrategy.UNISWAP_V2_SWAP, subPercent: "0" },
      ],
    }]);
  };

  const addRecipientGroup = () => {
    const flatRecipients = buildFlatRecipientsFromGroups(recipientGroups);
    if (recipientGroups.length >= 5 || flatRecipients.length >= 20) {
      alert("Maximum 5 recipient groups or 20 total recipients");
      return;
    }
    setRecipientGroups([
      ...recipientGroups,
      {
        wallet: "",
        sharePercent: "0",
        strategies: [
          { strategy: DeFiStrategy.DIRECT_TRANSFER, subPercent: "100" },
          { strategy: DeFiStrategy.AAVE_SUPPLY, subPercent: "0" },
          { strategy: DeFiStrategy.MORPHO_DEPOSIT, subPercent: "0" },
          { strategy: DeFiStrategy.UNISWAP_V2_SWAP, subPercent: "0" },
        ],
      },
    ]);
  };

  const removeRecipientGroup = (index: number) => {
    if (recipientGroups.length <= 1) {
      alert("At least one recipient required");
      return;
    }
    setRecipientGroups(recipientGroups.filter((_, i) => i !== index));
  };

  const updateRecipientField = (index: number, field: keyof RecipientGroup, value: string) => {
    const updated = [...recipientGroups];
    (updated[index] as any)[field] = value;
    setRecipientGroups(updated);
  };

  const updateStrategyField = (
    recipientIndex: number,
    strategyIndex: number,
    field: keyof StrategyAllocation,
    value: string | DeFiStrategy
  ) => {
    const updated = [...recipientGroups];
    if (field === "strategy") {
      updated[recipientIndex].strategies[strategyIndex][field] = value as DeFiStrategy;
    } else {
      updated[recipientIndex].strategies[strategyIndex][field] = value as string;
    }
    setRecipientGroups(updated);
  };

  const presetEvenSplit = (recipientIndex: number) => {
    const updated = [...recipientGroups];
    const n = updated[recipientIndex].strategies.length;
    const base = Math.floor(10000 / n) / 100;
    const remainder = 100 - base * (n - 1);
    updated[recipientIndex].strategies = updated[recipientIndex].strategies.map((s, i) => ({
      ...s,
      subPercent: String(i === n - 1 ? remainder : base),
    }));
    setRecipientGroups(updated);
  };

  const preset_60_30_10_0 = (recipientIndex: number) => {
    const updated = [...recipientGroups];
    const arr = [60, 30, 10, 0];
    updated[recipientIndex].strategies = updated[recipientIndex].strategies.map((s, i) => ({
      ...s,
      subPercent: String(arr[i] ?? 0),
    }));
    setRecipientGroups(updated);
  };

  const normalizeStrategies = (recipientIndex: number) => {
    const updated = [...recipientGroups];
    const sum = updated[recipientIndex].strategies.reduce((s, x) => s + (parseFloat(x.subPercent) || 0), 0);
    if (sum <= 0) {
      presetEvenSplit(recipientIndex);
      return;
    }
    updated[recipientIndex].strategies = updated[recipientIndex].strategies.map((s) => ({
      ...s,
      subPercent: String(((parseFloat(s.subPercent) || 0) / sum) * 100),
    }));
    setRecipientGroups(updated);
  };

  const flatRecipients = useMemo(() => buildFlatRecipientsFromGroups(recipientGroups), [recipientGroups]);
  const totalShareValue = useMemo(() => totalShare(flatRecipients), [flatRecipients]);
  const totalRecipientPercent = useMemo(() => {
    return recipientGroups.reduce((s, g) => s + (parseFloat(g.sharePercent) || 0), 0);
  }, [recipientGroups]);

  const validationMessages = useMemo(() => {
    const msgs: string[] = [];
    if (Math.abs(totalRecipientPercent - 100) >= 0.01) msgs.push("Recipients Total must be 100%");
    recipientGroups.forEach((g, i) => {
      const s = sumPercent(g.strategies.map((x) => x.subPercent));
      if (Math.abs(s - 100) >= 0.01) msgs.push(`Recipient ${i + 1}: Strategies Total must be 100%`);
      if (!isValidAddress(g.wallet)) msgs.push(`Recipient ${i + 1}: Invalid address`);
    });
    if (flatRecipients.length > 20) msgs.push("Recipients exceed 20");
    const amt = parseFloat(totalAmount);
    if (!totalAmount || isNaN(amt) || amt <= 0) msgs.push("Total amount must be greater than 0");
    return msgs;
  }, [recipientGroups, totalRecipientPercent, flatRecipients, totalAmount]);

  const isValid = validationMessages.length === 0;

  const buildFunctionParams = (token: string, amount: string, chainId: number) => {
    const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // Arbitrum Sepolia USDC
    const amountWei = parseUnits(amount, 6);
    const contractRecipients = toContractRecipients(flatRecipients);
    return {
      functionParams: [USDC_ADDRESS, amountWei, contractRecipients] as const,
    };
  };

  return (
    <div className="card">
      <h3>Gifting Splitter (Arbitrum Sepolia)</h3>

      <TotalsSummary recipients={flatRecipients} totalAmount={totalAmount} />

      <div style={{ marginBottom: "1rem" }}>
        <label className="field">
          <span>Total Amount (USDC)</span>
          <input
            type="number"
            min="0"
            step="0.000001"
            placeholder="e.g., 100"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="input"
          />
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <strong>Recipients ({recipientGroups.length}/5)</strong>
        </div>

        {recipientGroups.map((recipient, index) => (
          <RecipientCard
            key={index}
            recipient={recipient}
            index={index}
            canRemove={recipientGroups.length > 1}
            onRemove={() => removeRecipientGroup(index)}
            onUpdateRecipient={(field, value) => updateRecipientField(index, field, value)}
            onUpdateStrategy={(si, field, value) => updateStrategyField(index, si, field, value)}
            onPresetEvenSplit={() => presetEvenSplit(index)}
            onPreset_60_30_10_0={() => preset_60_30_10_0(index)}
            onNormalize={() => normalizeStrategies(index)}
          />
        ))}

        <button
          onClick={addRecipientGroup}
          disabled={recipientGroups.length >= 5 || flatRecipients.length >= 20}
          className="btn"
          style={{
            width: "100%",
            marginTop: "0.5rem",
            background: "#4CAF50",
            opacity: recipientGroups.length >= 5 || flatRecipients.length >= 20 ? 0.6 : 1,
          }}
        >
          + Add Recipient
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginTop: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <ConfigManager recipients={flatRecipients} onLoadConfig={handleLoadConfig} />
      </div>

      <BridgeAndExecuteButton
          contractAddress={FLEXIBLE_SPLITTER_ADDRESS}
          contractAbi={FLEXIBLE_SPLITTER_ABI}
          functionName="distributeTokens"
          prefill={{
            toChainId: 421614,
            token: "USDC",
          }}
          buildFunctionParams={buildFunctionParams}
        >
          {({ onClick, isLoading }) => (
            <button
              onClick={onClick}
              disabled={isLoading || !isValid}
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1rem",
                fontWeight: "bold",
                opacity: isValid && !isLoading ? 1 : 0.5,
                cursor: isValid && !isLoading ? "pointer" : "not-allowed",
                background: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
              }}
            >
              {isLoading ? "Processing..." : "🎁 Execute Gift Distribution"}
            </button>
          )}
        </BridgeAndExecuteButton>

      <ValidationMessages messages={validationMessages} />
    </div>
  );
}

export function GiftingSplitterArbitrumCard() {
  return (
    <ToastProvider>
      <GiftingSplitterArbitrumCardInner />
    </ToastProvider>
  );
}
