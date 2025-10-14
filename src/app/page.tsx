"use client";
import React from "react";
import {
  BridgeButton,
  TransferButton,
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";
import { useNexus } from "@avail-project/nexus-widgets";

export default function Home() {
  const { sdk, isSdkInitialized, initializeSdk } = useNexus();
  const [balances, setBalances] = React.useState<any | null>(null);
  const [loadingBalances, setLoadingBalances] = React.useState(false);

  const handleViewBalances = async () => {
    try {
      setLoadingBalances(true);
      if (!isSdkInitialized) {
        const provider = (window as any)?.ethereum;
        if (!provider) {
          throw new Error("Wallet provider not found. Please install or enable your wallet.");
        }
        await initializeSdk(provider);
      }
      const res = await sdk.getUnifiedBalances();
      setBalances(res);
    } catch (e) {
      setBalances({ error: (e as Error).message });
    } finally {
      setLoadingBalances(false);
    }
  };

  return (
    <main className="container">
      <h1 className="header">
        Use Avail Nexus
      </h1>

      <button
        onClick={handleViewBalances}
        disabled={loadingBalances}
        className="btn btn-accent"
      >
        {loadingBalances ? "Loading…" : "View Unified Balance"}
      </button>

      {balances && (
        <pre className="pre">
          {JSON.stringify(balances, null, 2)}
        </pre>
      )}

      <section className="grid">
        <div className="card">
          <h3>Bridge Tokens</h3>
          <BridgeButton>
            {({ onClick, isLoading }) => (
              <button
                onClick={async () => {
                  if (!isSdkInitialized) {
                    const provider = (window as any)?.ethereum;
                    if (!provider) {
                      throw new Error("Wallet provider not found. Please install or enable your wallet.");
                    }
                    await initializeSdk(provider);
                  }
                  await onClick();
                }}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? "Bridging…" : "Open Bridge"}
              </button>
            )}
          </BridgeButton>
        </div>

        <div className="card">
          <h3>Transfer Tokens</h3>
          <TransferButton>
            {({ onClick, isLoading }) => (
              <button
                onClick={async () => {
                  if (!isSdkInitialized) {
                    const provider = (window as any)?.ethereum;
                    if (!provider) {
                      throw new Error("Wallet provider not found. Please install or enable your wallet.");
                    }
                    await initializeSdk(provider);
                  }
                  await onClick();
                }}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? "Opening…" : "Open Transfer"}
              </button>
            )}
          </TransferButton>
        </div>

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
                  if (!isSdkInitialized) {
                    const provider = (window as any)?.ethereum;
                    if (!provider) {
                      throw new Error("Wallet provider not found. Please install or enable your wallet.");
                    }
                    await initializeSdk(provider);
                  }
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
      </section>
    </main>
  );
}

