"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

export function BridgeAndTransferCardBase() {
  return (
    <div className="card">
      <h3>{`Bridge & Transfer on Base Sepolia`}</h3>
      <BridgeAndExecuteButton
        contractAddress={"0xaa2574965ADA9D48Afd1832f7f6137aFe882922e"}
        contractAbi={[
          {
            name: "burn",
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
        functionName="burn"
        buildFunctionParams={(token, amount, chainId, userAddress) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const amountWei = parseUnits(amount, decimals);
          const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
          return {
            functionParams: [tokenAddress, amountWei, userAddress, 0],
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
            {isLoading ? "Processing…" : "Bridge & Transfer"}
          </button>
        )}
      </BridgeAndExecuteButton>
    </div>
  );
}
