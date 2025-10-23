"use client";
import React from "react";
import { BridgeAndExecuteButton } from "@avail-project/nexus-widgets";
import { FLEXIBLE_SPLITTER_ADDRESS } from "../types";
import { FLEXIBLE_SPLITTER_ABI } from "../abi";

type Props = {
  isValid: boolean;
  prefill: { toChainId: 421614; token: "USDC" };
  buildFunctionParams: (token: string, amount: string, chainId: number, userAddress?: string) => { functionParams: readonly any[] };
};

export function GiftingExecuteButton({ isValid, prefill, buildFunctionParams }: Props) {
  return (
    <BridgeAndExecuteButton
      contractAddress={FLEXIBLE_SPLITTER_ADDRESS}
      contractAbi={FLEXIBLE_SPLITTER_ABI}
      functionName="distributeTokens"
      prefill={prefill}
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
  );
}
