"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

export function BridgeAndExecuteCardOptimism() {
  return (
    <div className="card">
      <h3>{`Bridge & Supply on AAVE (Optimism Sepolia)`}</h3>
      <p className="text-sm">
        <a
          href="https://app.aave.com/reserve-overview/?underlyingAsset=0x5fd84259d66cd46123540766be93dfe6d43130d7&marketName=proto_optimism_sepolia_v3"
          target="_blank"
          rel="noreferrer"
        >
          Optimism Sepolia Market
        </a>
      </p>
      <BridgeAndExecuteButton
        contractAddress={"0xb50201558B00496A145fE76f7424749556E326D8"} // Optimism Sepolia固定
        contractAbi={[
          {
            name: "supply",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "asset", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "onBehalfOf", type: "address" },
              { name: "referralCode", type: "uint16" },
            ],
            outputs: [],
          },
        ] as const}
        functionName="supply"
        prefill={{ toChainId: 11155420, token: "USDC" }}
        buildFunctionParams={(tk, amt, chainId, user) => {
          const decimals = TOKEN_METADATA[tk].decimals;
          const amountWei = parseUnits(amt, decimals);
          const tokenAddr = TOKEN_CONTRACT_ADDRESSES[tk][chainId];
          return { functionParams: [tokenAddr, amountWei, user, 0] };
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
            {isLoading ? "Processing…" : "Bridge & Stake"}
          </button>
        )}
      </BridgeAndExecuteButton>
    </div>
  );
}
