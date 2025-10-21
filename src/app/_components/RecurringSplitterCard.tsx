"use client";
import React, { useState } from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

// Contract address (deployed on Arbitrum Sepolia)
const RECURRING_SPLITTER_ADDRESS = "0x6E5cb8981a716a472Fa6967608714Ab1a9Aae0E9";

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

export function RecurringSplitterCard() {
  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      wallet: "",
      sharePercent: "50",
      strategy: DeFiStrategy.MORPHO_DEPOSIT,
    },
    {
      wallet: "",
      sharePercent: "50",
      strategy: DeFiStrategy.DIRECT_TRANSFER,
    },
  ]);

  const [intervalMinutes, setIntervalMinutes] = useState("60");
  const [maxExecutions, setMaxExecutions] = useState("3");

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
    const validInterval = parseInt(intervalMinutes) >= 1 && parseInt(intervalMinutes) <= 525600;
    const validMaxExecutions = parseInt(maxExecutions) >= 0 && parseInt(maxExecutions) <= 1000;
    return Math.abs(totalShare - 100) < 0.01 && hasValidAddresses && validInterval && validMaxExecutions;
  };

  return (
    <div className="card">
      <h3>Recurring Token Splitter (Arbitrum Sepolia) 🔄</h3>
      <p className="text-sm" style={{ marginBottom: "1rem" }}>
        Create recurring token distributions with Gelato automation
      </p>

      {/* Schedule Configuration */}
      <div style={{ marginBottom: "1rem" }}>
        <label className="field">
          <span>Interval (minutes)</span>
          <input
            type="number"
            min="1"
            max="525600"
            value={intervalMinutes}
            onChange={(e) => setIntervalMinutes(e.target.value)}
            className="input"
            placeholder="60 = 1 hour, 1440 = 1 day"
          />
        </label>

        <label className="field">
          <span>Max Executions (0 = unlimited)</span>
          <input
            type="number"
            min="0"
            max="1000"
            value={maxExecutions}
            onChange={(e) => setMaxExecutions(e.target.value)}
            className="input"
          />
        </label>
      </div>

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
        contractAddress={RECURRING_SPLITTER_ADDRESS}
        contractAbi={
          [
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
          ] as const
        }
        functionName="createSchedule"
        prefill={{ toChainId: 421614, token: "USDC" }}
        buildFunctionParams={(token, amount, chainId, userAddress) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const totalAmountWei = parseUnits(amount, decimals);
          const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];

          // Calculate amount per execution
          // Nexus Widget amount = amountPerExecution × maxExecutions
          const maxExec = parseInt(maxExecutions);
          const amountPerExecution = maxExec > 0 ? totalAmountWei / BigInt(maxExec) : totalAmountWei;

          // Convert recipients to contract format
          const contractRecipients = recipients.map((r) => ({
            wallet: r.wallet as `0x${string}`,
            sharePercent: Math.round(parseFloat(r.sharePercent) * 100), // Convert to basis points
            strategy: r.strategy,
          }));

          const intervalSeconds = parseInt(intervalMinutes) * 60;

          return {
            functionParams: [
              tokenAddress,
              amountPerExecution,
              contractRecipients,
              intervalSeconds,
              maxExec,
            ],
          };
        }}
      >
        {({ onClick, isLoading }) => (
          <button
            onClick={async () => {
              if (!isValidConfiguration()) {
                alert(
                  "Please ensure all addresses are valid, total share is 100%, and interval/executions are valid"
                );
                return;
              }
              await onClick();
            }}
            disabled={isLoading || !isValidConfiguration()}
            className="btn btn-primary"
          >
            {isLoading ? "Processing…" : "Create Recurring Schedule"}
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
        <strong>How it works:</strong>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>
            <strong>Recurring Distribution:</strong> Automatically distributes tokens at set intervals
          </li>
          <li>
            <strong>Gelato Automation:</strong> No manual execution needed after setup
          </li>
          <li>
            <strong>Flexible Strategies:</strong> Each recipient can have different DeFi strategies
          </li>
          <li>
            <strong>Max Executions:</strong> Set limit or run unlimited (0)
          </li>
        </ul>
        <div style={{ marginTop: "0.5rem", color: "#0066cc", background: "#e6f2ff", padding: "0.5rem", borderRadius: "4px" }}>
          💡 <strong>Amount Calculation:</strong> The total amount you enter will be divided by max executions.
          <br />
          Example: 3 USDC with 3 executions = 1 USDC per execution
        </div>
        <div style={{ marginTop: "0.5rem", color: "#ff6600" }}>
          ⚠️ <strong>Important:</strong> The widget will automatically approve the total amount (amount per execution × max executions)
        </div>
      </div>
    </div>
  );
}
