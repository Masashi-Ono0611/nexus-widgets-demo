"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

const MORPHO_DEPOSIT_SPLITTER_CONTRACT_ADDRESS = "0x104A5ED0a02e95b23D0C29543Ab8Bed5Dd4010eD";

export function MorphoSplitDepositBaseCard() {
  const [sharePercent, setSharePercent] = React.useState("50");

  const clampShare = (value: string) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return "0";
    }
    return Math.max(0, Math.min(100, numeric)).toString();
  };

  return (
    <div className="card">
      <h3>{`Bridge & Split Deposit to Morpho Vault (Base Sepolia)`}</h3>
      <label className="field">
        <span>Split share for address 1 (0-100%)</span>
        <input
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={sharePercent}
          onChange={(event) => {
            setSharePercent(clampShare(event.target.value));
          }}
          className="input"
        />
      </label>
      <BridgeAndExecuteButton
        contractAddress={MORPHO_DEPOSIT_SPLITTER_CONTRACT_ADDRESS}
        contractAbi={[
          {
            name: "splitDeposit",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "asset", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "onBehalfOf", type: "address" },
              { name: "shareBasisPoints", type: "uint16" },
            ],
            outputs: [{ name: "totalShares", type: "uint256" }],
          },
        ] as const}
        functionName="splitDeposit"
        buildFunctionParams={(token, amount, chainId, userAddress) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const amountWei = parseUnits(amount, decimals);
          const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
          const shareValue = Number(sharePercent);
          const boundedShare = Number.isNaN(shareValue)
            ? 50
            : Math.max(0, Math.min(100, shareValue));
          const shareBasisPoints = Math.round(boundedShare * 100);
          return {
            functionParams: [tokenAddress, amountWei, userAddress, shareBasisPoints],
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
            {isLoading ? "Processing…" : "Bridge & Split Deposit"}
          </button>
        )}
      </BridgeAndExecuteButton>
    </div>
  );
}
