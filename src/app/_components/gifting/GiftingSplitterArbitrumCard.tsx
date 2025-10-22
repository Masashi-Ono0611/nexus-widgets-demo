"use client";
import React, { useMemo, useState } from "react";
import { BridgeAndExecuteButton } from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";
import { DeFiStrategy, Recipient, FLEXIBLE_SPLITTER_ADDRESS } from "./types";
import { isValidAddress, toContractRecipients, totalShare } from "./utils";
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
  const [recipients, setRecipients] = useState<Recipient[]>([
    { wallet: "", sharePercent: "100", strategy: DeFiStrategy.DIRECT_TRANSFER },
  ]);
  const [totalAmount, setTotalAmount] = useState("");

  const handleLoadConfig = (loadedRecipients: Recipient[]) => {
    setRecipients(loadedRecipients);
  };

  const addRecipient = () => {
    if (recipients.length >= 20) {
      alert("Maximum 20 recipients allowed");
      return;
    }
    setRecipients([...recipients, { wallet: "", sharePercent: "0", strategy: DeFiStrategy.DIRECT_TRANSFER }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length <= 1) {
      alert("At least one recipient required");
      return;
    }
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string | DeFiStrategy) => {
    const updated = [...recipients];
    (updated[index] as any)[field] = value;
    setRecipients(updated);
  };

  const presetEvenSplit = () => {
    const n = recipients.length;
    const base = Math.floor(10000 / n) / 100;
    const remainder = 100 - base * (n - 1);
    setRecipients(
      recipients.map((r, i) => ({
        ...r,
        sharePercent: String(i === n - 1 ? remainder : base),
      }))
    );
  };

  const normalizePercentages = () => {
    const sum = recipients.reduce((s, r) => s + (parseFloat(r.sharePercent) || 0), 0);
    if (sum <= 0) {
      presetEvenSplit();
      return;
    }
    setRecipients(
      recipients.map((r) => ({
        ...r,
        sharePercent: String(((parseFloat(r.sharePercent) || 0) / sum) * 100),
      }))
    );
  };

  const totalShareValue = useMemo(() => totalShare(recipients), [recipients]);

  const validationMessages = useMemo(() => {
    const msgs: string[] = [];
    if (recipients.length === 0) msgs.push("At least one recipient required");
    if (recipients.length > 20) msgs.push("Maximum 20 recipients allowed");
    recipients.forEach((r, i) => {
      if (!isValidAddress(r.wallet)) msgs.push(`Recipient ${i + 1}: Invalid wallet address`);
      const pct = parseFloat(r.sharePercent);
      if (isNaN(pct) || pct < 0 || pct > 100) msgs.push(`Recipient ${i + 1}: Invalid percentage`);
    });
    if (Math.abs(totalShareValue - 100) > 0.01) msgs.push("Total percentage must equal 100%");
    const amt = parseFloat(totalAmount);
    if (!totalAmount || isNaN(amt) || amt <= 0) msgs.push("Total amount must be greater than 0");
    return msgs;
  }, [recipients, totalShareValue, totalAmount]);

  const isValid = validationMessages.length === 0;

  const buildFunctionParams = (token: string, amount: string, chainId: number) => {
    const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // Arbitrum Sepolia USDC
    const amountWei = parseUnits(amount, 6);
    const contractRecipients = toContractRecipients(recipients);
    return {
      functionParams: [USDC_ADDRESS, amountWei, contractRecipients] as const,
    };
  };

  return (
    <div className="card">
      <h3>Gifting Splitter (Arbitrum Sepolia)</h3>

      <TotalsSummary recipients={recipients} totalAmount={totalAmount} />

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
          <strong>Recipients ({recipients.length}/20)</strong>
        </div>

        {recipients.map((recipient, index) => (
          <RecipientCard
            key={index}
            recipient={recipient}
            index={index}
            onUpdate={(field, value) => updateRecipient(index, field, value)}
            onRemove={() => removeRecipient(index)}
          />
        ))}

        <button
          onClick={addRecipient}
          disabled={recipients.length >= 20}
          className="btn"
          style={{
            width: "100%",
            marginTop: "0.5rem",
            background: "#4CAF50",
            opacity: recipients.length >= 20 ? 0.6 : 1,
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
        <ConfigManager recipients={recipients} onLoadConfig={handleLoadConfig} />
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
