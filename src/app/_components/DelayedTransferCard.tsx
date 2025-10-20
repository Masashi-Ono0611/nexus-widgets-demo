"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

const DELAYED_TRANSFER_CONTRACT_ADDRESS = "0x529B72c62d0eF4C00E6B346e2D15C23f630389d1";

export function DelayedTransferCard() {
  const [recipientAddress, setRecipientAddress] = React.useState("");
  const [delayHours, setDelayHours] = React.useState("24");

  const clampDelay = (value: string) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return "1";
    }
    // Min: 1 minute (0.0167 hours), Max: 365 days (8760 hours)
    return Math.max(0.0167, Math.min(8760, numeric)).toString();
  };

  return (
    <div className="card">
      <h3>{`Bridge & Schedule Delayed Transfer (Base Sepolia)`}</h3>
      <p style={{ fontSize: "0.9em", color: "#666", marginBottom: "1rem" }}>
        ✨ Gelato Automateで自動実行される時間差送金<br />
        <strong>初回呼び出し時にGelatoタスクが自動作成されます</strong>
      </p>
      
      <label className="field">
        <span>Recipient Address (受取人アドレス)</span>
        <input
          type="text"
          placeholder="0x..."
          value={recipientAddress}
          onChange={(event) => setRecipientAddress(event.target.value)}
          className="input"
        />
      </label>

      <label className="field">
        <span>Delay Time (遅延時間: 時間単位)</span>
        <input
          type="number"
          min={0.0167}
          max={8760}
          step={0.1}
          value={delayHours}
          onChange={(event) => {
            setDelayHours(clampDelay(event.target.value));
          }}
          className="input"
        />
        <small style={{ color: "#666" }}>
          例: 24 = 24時間後、0.5 = 30分後
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
          
          // 遅延時間を秒に変換
          const delayValue = Number(delayHours);
          const delaySeconds = Math.floor(
            (Number.isNaN(delayValue) ? 24 : delayValue) * 3600
          );

          // 受取人アドレスのバリデーション
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

      <div style={{ marginTop: "1rem", padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
        <h4 style={{ marginTop: 0 }}>🎯 使い方</h4>
        <ol style={{ fontSize: "0.9em", lineHeight: "1.6" }}>
          <li>受取人アドレスと遅延時間を入力</li>
          <li>「Bridge & Schedule Transfer」ボタンをクリック</li>
          <li>初回のみ: Gelatoタスクが自動作成されます（追加のガス代が必要）</li>
          <li>指定時間後、Gelatoが自動的に転送を実行します</li>
        </ol>
        <p style={{ fontSize: "0.85em", color: "#666", marginTop: "0.5rem", marginBottom: 0 }}>
          💡 コントラクト: <code style={{ background: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.9em" }}>{DELAYED_TRANSFER_CONTRACT_ADDRESS}</code>
        </p>
      </div>
    </div>
  );
}
