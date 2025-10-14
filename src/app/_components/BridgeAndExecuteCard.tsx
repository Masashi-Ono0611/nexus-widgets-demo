"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

export function BridgeAndExecuteCard() {
  return (
    <div className="card">
      <h3>{`Bridge & Supply on AAVE`}</h3>
      <BridgeAndExecuteButton
        contractAddress={"0x794a61358D6845594F94dc1DB02A252b5b4814aD"}
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
