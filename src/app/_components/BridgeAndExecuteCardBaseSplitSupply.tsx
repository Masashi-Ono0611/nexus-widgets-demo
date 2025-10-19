"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

const AUTO_SUPPLY_SPLITTER_CONTRACT_ADDRESS = "0xe8cE9fA1670c3Fd34f2e465FaB95990CB6567909";

export function BridgeAndExecuteCardBaseSplitSupply() {
  return (
    <div className="card">
      <h3>{`Bridge & Split Supply to Mock AAVE`}</h3>
      <BridgeAndExecuteButton
        contractAddress={AUTO_SUPPLY_SPLITTER_CONTRACT_ADDRESS}
        contractAbi={[
          {
            name: "splitSupply",
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
        functionName="splitSupply"
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
            {isLoading ? "Processing…" : "Bridge & Split Supply"}
          </button>
        )}
      </BridgeAndExecuteButton>
    </div>
  );
}
