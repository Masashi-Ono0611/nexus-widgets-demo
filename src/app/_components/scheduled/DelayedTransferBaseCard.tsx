"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

const DELAYED_TRANSFER_CONTRACT_ADDRESS = "0x9B31E6D589657d37fFf3d8D8f3699C8d28c4B8F9";

export function DelayedTransferBaseCard() {
  const [recipientAddress, setRecipientAddress] = React.useState("");
  const [delayMinutes, setDelayMinutes] = React.useState("60");

  const clampDelay = (value: string) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return "1";
    }
    // Min: 1 minute, Max: 365 days (525600 minutes)
    return Math.max(1, Math.min(525600, numeric)).toString();
  };

  return (
    <div className="card">
      <h3>{`Bridge & Schedule Delayed Transfer (Base Sepolia)`}</h3>
      <p style={{ fontSize: "0.9em", color: "#555", marginBottom: "1rem" }}>
        ✨ Automated delayed transfer powered by Gelato Automate<br />
        <strong>Gelato task is automatically created on first use</strong>
      </p>
      
      <label className="field">
        <span>Recipient Address</span>
        <input
          type="text"
          placeholder="0x..."
          value={recipientAddress}
          onChange={(event) => setRecipientAddress(event.target.value)}
          className="input"
        />
      </label>

      <label className="field">
        <span>Delay Time (minutes)</span>
        <input
          type="number"
          min={1}
          max={525600}
          step={1}
          value={delayMinutes}
          onChange={(event) => {
            setDelayMinutes(clampDelay(event.target.value));
          }}
          className="input"
        />
        <small style={{ color: "#555" }}>
          Examples: 60 = 1 hour, 1440 = 1 day, 10080 = 1 week
        </small>
      </label>

      <BridgeAndExecuteButton
        contractAddress={DELAYED_TRANSFER_CONTRACT_ADDRESS}
        contractAbi={[
          {
            name: "scheduleTransfer",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "asset", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "recipient", type: "address" },
              { name: "delaySeconds", type: "uint256" },
            ],
            outputs: [{ name: "transferId", type: "uint256" }],
          },
        ] as const}
        functionName="scheduleTransfer"
        prefill={{ toChainId: 84532, token: "USDC" }}
        buildFunctionParams={(token, amount, chainId, userAddress) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const amountWei = parseUnits(amount, decimals);
          const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
          
          // Convert delay time to seconds
          const delayValue = Number(delayMinutes);
          const delaySeconds = Math.floor(
            (Number.isNaN(delayValue) ? 60 : delayValue) * 60
          );

          // Validate recipient address
          const recipient = recipientAddress.trim() || userAddress;

          return {
            functionParams: [tokenAddress, amountWei, recipient, delaySeconds],
          };
        }}
      >
        {({ onClick, isLoading }) => (
          <button
            onClick={async () => {
              await onClick();
            }}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? "Processing…" : "Bridge & Schedule Transfer"}
          </button>
        )}
      </BridgeAndExecuteButton>

      <div style={{ marginTop: "1rem", padding: "1rem", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
        <h4 style={{ marginTop: 0, color: "#333" }}>🎯 How to Use</h4>
        <ol style={{ fontSize: "0.9em", lineHeight: "1.6", color: "#444" }}>
          <li>Enter recipient address and delay time in minutes</li>
          <li>Click "Bridge & Schedule Transfer" button</li>
          <li>First time only: Gelato task will be created (requires additional gas)</li>
          <li>After the specified time, Gelato will automatically execute the transfer</li>
        </ol>
        <p style={{ fontSize: "0.85em", color: "#555", marginTop: "0.5rem", marginBottom: 0 }}>
          💡 Contract: <code style={{ background: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.9em", border: "1px solid #ddd", color: "#333" }}>{DELAYED_TRANSFER_CONTRACT_ADDRESS}</code>
        </p>
      </div>
    </div>
  );
}
