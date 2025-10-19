"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

export function BridgeAndExecuteCardBaseMorphoVault() {
  return (
    <div className="card">
      <h3>{`Bridge & Deposit to Morpho Vault v2 (Base Sepolia)`}</h3>
      <BridgeAndExecuteButton
        contractAddress={"0x66db50a789a15f4a368a1b3dcb05615be651fc05"}
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
