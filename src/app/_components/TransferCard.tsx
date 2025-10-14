"use client";
import React from "react";
import { TransferButton, type TransferParams } from "@avail-project/nexus-widgets";
import { useNexus } from "@avail-project/nexus-widgets";

interface TransferCardProps {
  prefill?: Partial<TransferParams>;
}

export function TransferCard({ prefill }: TransferCardProps) {
  const { isSdkInitialized, initializeSdk } = useNexus();

  return (
    <div className="card">
      <h3>Transfer Tokens</h3>
      <TransferButton prefill={prefill}>
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
  );
}
