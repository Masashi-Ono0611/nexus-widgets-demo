"use client";
import React from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

export function UniswapV4SwapCard() {
  return (
    <div className="card">
      <h3>{`Bridge & Swap USDC to WETH (Uniswap V4 - Base Sepolia)`}</h3>
      <BridgeAndExecuteButton
        contractAddress={"0x71cD4Ea054F9Cb3D3BF6251A00673303411A7DD9"}
        contractAbi={[
          {
            name: "swapExactTokensForTokens",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "amountIn", type: "uint256" },
              { name: "amountOutMin", type: "uint256" },
              { name: "zeroForOne", type: "bool" },
              {
                name: "poolKey",
                type: "tuple",
                components: [
                  { name: "currency0", type: "address" },
                  { name: "currency1", type: "address" },
                  { name: "fee", type: "uint24" },
                  { name: "tickSpacing", type: "int24" },
                  { name: "hooks", type: "address" },
                ],
              },
              { name: "hookData", type: "bytes" },
              { name: "receiver", type: "address" },
              { name: "deadline", type: "uint256" },
            ],
            outputs: [{ name: "amountOut", type: "uint256" }],
          },
        ] as const}
        functionName="swapExactTokensForTokens"
        prefill={{ toChainId: 84532, token: "USDC" }}
        buildFunctionParams={(tk, amt, chainId, user) => {
          const decimals = TOKEN_METADATA[tk].decimals;
          const amountWei = parseUnits(amt, decimals);

          // Pool configuration for USDC/WETH pool
          const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
          const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
          const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

          const poolKey = {
            currency0: USDC_ADDRESS, // USDC < WETH by address
            currency1: WETH_ADDRESS,
            fee: 3000, // 0.3%
            tickSpacing: 1, // Most precise
            hooks: ZERO_ADDRESS, // No hook
          };

          const amountOutMin = BigInt(0); // No slippage protection (set proper value in production)
          const zeroForOne = true; // USDC -> WETH
          const hookData = "0x"; // Empty hook data
          const deadline = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 minutes from now

          return {
            functionParams: [
              amountWei,
              amountOutMin,
              zeroForOne,
              poolKey,
              hookData,
              user,
              deadline,
            ],
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
            {isLoading ? "Processing…" : "Bridge & Swap (USDC → WETH)"}
          </button>
        )}
      </BridgeAndExecuteButton>
    </div>
  );
}
