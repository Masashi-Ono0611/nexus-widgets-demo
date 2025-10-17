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
        contractAddress={"0x112f5d69E79032102A6e313da3cd379522EF4D8A"}
        contractAbi={[
          {
            name: "forward",
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
        functionName="forward"
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
