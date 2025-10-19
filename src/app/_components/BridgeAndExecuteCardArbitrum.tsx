"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

export function BridgeAndExecuteCardArbitrum() {
  return (
    <div className="card">
      <h3>{`Bridge & Supply on AAVE (Arbitrum Sepolia)`}</h3>
      <p className="text-sm">
        <a
          href="https://app.aave.com/reserve-overview/?underlyingAsset=0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d&marketName=proto_arbitrum_sepolia_v3"
          target="_blank"
          rel="noreferrer"
        >
          Arbitrum Sepolia Market
        </a>
      </p>
      <BridgeAndExecuteButton
        contractAddress={"0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff"} // Arbitrum Sepolia固定
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
        prefill={{ toChainId: 421614, token: "USDC" }}
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
