"use client";
import React from "react";
import { BridgeButton } from "@avail-project/nexus-widgets";
import { useNexus } from "@avail-project/nexus-widgets";

export function BridgeCard() {
  const { isSdkInitialized, initializeSdk } = useNexus();

  return (
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
  );
}
