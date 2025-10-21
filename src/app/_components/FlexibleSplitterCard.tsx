"use client";
import React, { useState } from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

// Contract address (deployed on Base Sepolia)
const FLEXIBLE_SPLITTER_ADDRESS = "0x81436a64A677f9074f512BA86094beDb29E5E5e9";

// DeFi Strategy enum (must match contract)
enum DeFiStrategy {
  DIRECT_TRANSFER = 0,
  AAVE_SUPPLY = 1,
  MORPHO_DEPOSIT = 2,
}

interface Recipient {
  wallet: string;
  sharePercent: string;
  strategy: DeFiStrategy;
}

const STRATEGY_LABELS = {
  [DeFiStrategy.DIRECT_TRANSFER]: "Direct Transfer",
  [DeFiStrategy.AAVE_SUPPLY]: "AAVE Supply",
  [DeFiStrategy.MORPHO_DEPOSIT]: "Morpho Deposit",
};

export function FlexibleSplitterCard() {
  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      wallet: "",
      sharePercent: "50",
      strategy: DeFiStrategy.DIRECT_TRANSFER,
    },
    {
      wallet: "",
      sharePercent: "50",
      strategy: DeFiStrategy.DIRECT_TRANSFER,
    },
  ]);

  const addRecipient = () => {
    if (recipients.length >= 20) {
      alert("Maximum 20 recipients allowed");
      return;
    }
    setRecipients([
      ...recipients,
      {
        wallet: "",
        sharePercent: "0",
        strategy: DeFiStrategy.DIRECT_TRANSFER,
      },
    ]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length <= 1) {
      alert("At least one recipient required");
      return;
    }
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (
    index: number,
    field: keyof Recipient,
    value: string | DeFiStrategy
  ) => {
    const updated = [...recipients];
    if (field === "strategy") {
      updated[index][field] = value as DeFiStrategy;
    } else {
      updated[index][field] = value as string;
    }
    setRecipients(updated);
  };

  const getTotalShare = () => {
    return recipients.reduce(
      (sum, r) => sum + (parseFloat(r.sharePercent) || 0),
      0
    );
  };

  const isValidConfiguration = () => {
    const totalShare = getTotalShare();
    const hasValidAddresses = recipients.every(
      (r) => r.wallet && r.wallet.startsWith("0x") && r.wallet.length === 42
    );
    return Math.abs(totalShare - 100) < 0.01 && hasValidAddresses;
  };

  return (
    <div className="card">
      <h3>Flexible Token Splitter (Base Sepolia)</h3>
      <p className="text-sm" style={{ marginBottom: "1rem" }}>
        Distribute tokens to multiple recipients with different DeFi strategies
      </p>

      {/* Recipients Configuration */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <strong>Recipients ({recipients.length}/20)</strong>
          <span
            style={{
              color: isValidConfiguration() ? "green" : "red",
              fontSize: "0.9rem",
            }}
          >
            Total: {getTotalShare().toFixed(2)}%
            {isValidConfiguration() ? " ✓" : " (must be 100%)"}
          </span>
        </div>

        {recipients.map((recipient, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "0.75rem",
              marginBottom: "0.5rem",
              borderRadius: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <strong>Recipient {index + 1}</strong>
              {recipients.length > 1 && (
                <button
                  onClick={() => removeRecipient(index)}
                  className="btn"
                  style={{
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    background: "#ff4444",
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <label className="field">
              <span>Wallet Address</span>
              <input
                type="text"
                placeholder="0x..."
                value={recipient.wallet}
                onChange={(e) =>
                  updateRecipient(index, "wallet", e.target.value)
                }
                className="input"
              />
            </label>

            <label className="field">
              <span>Share Percentage (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={recipient.sharePercent}
                onChange={(e) =>
                  updateRecipient(index, "sharePercent", e.target.value)
                }
                className="input"
              />
            </label>

            <label className="field">
              <span>DeFi Strategy</span>
              <select
                value={recipient.strategy}
                onChange={(e) =>
                  updateRecipient(
                    index,
                    "strategy",
                    parseInt(e.target.value) as DeFiStrategy
                  )
                }
                className="input"
              >
                {Object.entries(STRATEGY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}

        <button
          onClick={addRecipient}
          className="btn"
          style={{
            width: "100%",
            marginTop: "0.5rem",
            background: "#4CAF50",
          }}
          disabled={recipients.length >= 20}
        >
          + Add Recipient
        </button>
      </div>

      {/* Bridge and Execute Button */}
      <BridgeAndExecuteButton
        contractAddress={FLEXIBLE_SPLITTER_ADDRESS}
        contractAbi={
          [
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
          ] as const
        }
        functionName="distributePayroll"
        prefill={{ toChainId: 84532, token: "USDC" }}
        buildFunctionParams={(token, amount, chainId, userAddress) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const amountWei = parseUnits(amount, decimals);
          const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];

          // Convert recipients to contract format
          const contractRecipients = recipients.map((r) => ({
            wallet: r.wallet as `0x${string}`,
            sharePercent: Math.round(parseFloat(r.sharePercent) * 100), // Convert to basis points
            strategy: r.strategy,
          }));

          return {
            functionParams: [tokenAddress, amountWei, contractRecipients],
          };
        }}
      >
        {({ onClick, isLoading }) => (
          <button
            onClick={async () => {
              if (!isValidConfiguration()) {
                alert(
                  "Please ensure all addresses are valid and total share is 100%"
                );
                return;
              }
              await onClick();
            }}
            disabled={isLoading || !isValidConfiguration()}
            className="btn btn-primary"
          >
            {isLoading ? "Processing…" : "Bridge & Distribute Tokens"}
          </button>
        )}
      </BridgeAndExecuteButton>

      {/* Info Section */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          background: "#f5f5f5",
          borderRadius: "4px",
          fontSize: "0.85rem",
        }}
      >
        <strong>Strategy Details:</strong>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>
            <strong>Direct Transfer:</strong> Tokens sent directly to recipient
            wallet
          </li>
          <li>
            <strong>AAVE Supply:</strong> Tokens supplied to AAVE on behalf of
            recipient
          </li>
          <li>
            <strong>Morpho Deposit:</strong> Tokens deposited to Morpho Vault
            on behalf of recipient
          </li>
        </ul>
      </div>
    </div>
  );
}
