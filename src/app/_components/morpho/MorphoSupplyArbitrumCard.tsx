"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

export function MorphoSupplyArbitrumCard() {
  return (
    <div className="card">
      <h3>{`Bridge & Deposit to Morpho Vault v2 (Arbitrum Sepolia)`}</h3>
      <BridgeAndExecuteButton
        contractAddress={"0xAbF102ed5F977331BDaD74D9136B6bFb7A2F09B6"}
        contractAbi={[
          {
            name: "deposit",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "assets", type: "uint256" },
              { name: "onBehalf", type: "address" },
            ],
            outputs: [{ name: "shares", type: "uint256" }],
          },
        ] as const}
        functionName="deposit"
        prefill={{ toChainId: 421614, token: "USDC" }}
        buildFunctionParams={(tk, amt, chainId, user) => {
          const decimals = TOKEN_METADATA[tk].decimals;
          const amountWei = parseUnits(amt, decimals);
          return { functionParams: [amountWei, user] };
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
            {isLoading ? "Processing…" : "Bridge & Deposit (Morpho Vault)"}
          </button>
        )}
      </BridgeAndExecuteButton>
    </div>
  );
}
