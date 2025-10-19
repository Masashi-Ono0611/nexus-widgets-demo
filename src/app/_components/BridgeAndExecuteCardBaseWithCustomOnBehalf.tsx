"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

export function BridgeAndExecuteCardBaseWithCustomOnBehalf() {
  const [targetAddress, setTargetAddress] = React.useState("");

  return (
    <div className="card">
      <h3>{`Bridge & Supply on Mock AAVE (Base Sepolia) with custom onBehalfOf`}</h3>
      <label className="field">
        <span>Custom onBehalfOf address</span>
        <input
          type="text"
          placeholder="0x..."
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
          className="input"
        />
      </label>
      <BridgeAndExecuteButton
        contractAddress={"0x00E3B1c858686A0e64Dfdb9F861CC659B96580b0"}
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
        buildFunctionParams={(token, amount, chainId, userAddress) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const amountWei = parseUnits(amount, decimals);
          const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
          const finalAddress = targetAddress || userAddress;
          return { functionParams: [tokenAddress, amountWei, finalAddress, 0] };
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
            {isLoading ? "Processing…" : "Bridge & Supply (Base, custom onBehalfOf)"}
          </button>
        )}
      </BridgeAndExecuteButton>
    </div>
  );
}
