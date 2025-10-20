"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

const AAVE_SUPPLY_SPLITTER_ARBITRUM_ADDRESS = "0x095e3b6cB84BDf0C65C0fCC7190d5Cd3388b9E36";

export function SplitSupplyArbitrumCard() {
  const [sharePercent, setSharePercent] = React.useState("50");

  const clampShare = (value: string) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return "0";
    }
    return Math.max(0, Math.min(100, numeric)).toString();
  };

  return (
    <div className="card">
      <h3>{`Bridge & Split Supply to AAVE (Arbitrum Sepolia)`}</h3>
      <p className="text-sm">
        <a
          href="https://app.aave.com/reserve-overview/?underlyingAsset=0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d&marketName=proto_arbitrum_sepolia_v3"
          target="_blank"
          rel="noreferrer"
        >
          Arbitrum Sepolia Market
        </a>
      </p>
      <label className="field">
        <span>Split share for address 1 (0-100%)</span>
        <input
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={sharePercent}
          onChange={(event) => {
            setSharePercent(clampShare(event.target.value));
          }}
          className="input"
        />
      </label>
      <BridgeAndExecuteButton
        contractAddress={AAVE_SUPPLY_SPLITTER_ARBITRUM_ADDRESS}
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
              { name: "shareBasisPoints", type: "uint16" },
            ],
            outputs: [],
          },
        ] as const}
        functionName="splitSupply"
        prefill={{ toChainId: 421614, token: "USDC" }}
        buildFunctionParams={(token, amount, chainId, userAddress) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const amountWei = parseUnits(amount, decimals);
          const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
          const shareValue = Number(sharePercent);
          const boundedShare = Number.isNaN(shareValue)
            ? 50
            : Math.max(0, Math.min(100, shareValue));
          const shareBasisPoints = Math.round(boundedShare * 100);
          return {
            functionParams: [tokenAddress, amountWei, userAddress, 0, shareBasisPoints],
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
