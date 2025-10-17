"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

export function BridgeAndStakeCardBase() {
  return (
    <div className="card">
      <h3>{`Bridge & Stake on Mock AAVE (Base Sepolia)`}</h3>
      <BridgeAndExecuteButton
        contractAddress={"0xa75177675388849a4B0fb973a3951444429f4a22"}
        contractAbi={[
          {
            name: "stake",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "asset", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "staker", type: "address" },
              { name: "referralCode", type: "uint16" },
            ],
            outputs: [],
          },
        ] as const}
        functionName="stake"
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
            {isLoading ? "Processing…" : "Bridge & Stake (Base)"}
          </button>
        )}
      </BridgeAndExecuteButton>
    </div>
  );
}
