"use client";

import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";

const DEFAULT_PAYMENT_SPLITTER_ADDRESS =
  "0x000000000000000000000000000000000000dEaD" as const;

const CONFIGURED_PAYMENT_SPLITTER_ADDRESS =
  process.env.NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS as
    | `0x${string}`
    | undefined;

const PAYMENT_SPLITTER_ADDRESS =
  (CONFIGURED_PAYMENT_SPLITTER_ADDRESS ?? DEFAULT_PAYMENT_SPLITTER_ADDRESS) as `0x${string}`;

const DEFAULT_PREFILL = {
  toChainId: 84532,
  token: "USDC",
} as const;

const PAYMENT_SPLITTER_ABI = [
  {
    name: "distribute",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "totalAmount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export function BridgeAndSplitCard() {
  const isConfigured = Boolean(CONFIGURED_PAYMENT_SPLITTER_ADDRESS);

  return (
    <div className="card">
      <h3>Bridge & Split USDC</h3>
      <BridgeAndExecuteButton
        contractAddress={PAYMENT_SPLITTER_ADDRESS}
        contractAbi={PAYMENT_SPLITTER_ABI}
        functionName="distribute"
        prefill={DEFAULT_PREFILL}
        buildFunctionParams={(token, amount, chainId) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const amountWei = BigInt(amount);
          const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
          console.log("[BridgeAndSplit] buildFunctionParams", {
            token,
            amount,
            chainId,
            tokenAddress,
            decimals,
            amountWei: amountWei.toString(),
          });
          return { functionParams: [tokenAddress, amountWei] };
        }}
      >
        {({ onClick, isLoading, disabled }) => (
          <button
            onClick={async () => {
              try {
                await onClick();
              } catch (error) {
                console.error("[BridgeAndSplit] onClick error", error);
                throw error;
              }
            }}
            disabled={disabled || isLoading || !isConfigured}
            className="btn btn-primary"
          >
            {isConfigured
              ? isLoading
                ? "Processing Split…"
                : "Bridge & Split"
              : "Configure Splitter"}
          </button>
        )}
      </BridgeAndExecuteButton>
    </div>
  );
}
