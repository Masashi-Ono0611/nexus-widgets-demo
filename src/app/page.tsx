"use client";
import React from "react";
import { useNexus } from "@avail-project/nexus-widgets";
import { BridgeCard } from "./_components/BridgeCard";
import { TransferCard } from "./_components/TransferCard";
import { BridgeAndExecuteCardOptimism } from "./_components/BridgeAndExecuteCardOptimism";
import { BridgeAndExecuteCardArbitrum } from "./_components/BridgeAndExecuteCardArbitrum";
import { BridgeAndExecuteCardBaseSplitSupply } from "./_components/BridgeAndExecuteCardBaseSplitSupply";
import { BridgeAndExecuteCardBaseMorphoVault } from "./_components/BridgeAndExecuteCardBaseMorphoVault";
import { BridgeAndExecuteCardMorphoSplitDeposit } from "./_components/BridgeAndExecuteCardMorphoSplitDeposit";
import { BridgeAndTransferCardBase } from "./_components/BridgeAndTransferCardBase";
import { BridgeAndSplitCardBase } from "./_components/BridgeAndSplitCardBase";


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

      <div className="action-bar">
        <button
          onClick={handleViewBalances}
          disabled={loadingBalances}
          className="btn btn-accent"
        >
          {loadingBalances ? "Loading…" : "View Unified Balance"}
        </button>
        <a href="/receive-qr" className="btn btn-primary">
          Generate Receive URL
        </a>
      </div>

      {balances && (
        <pre className="pre">
          {JSON.stringify(balances, null, 2)}
        </pre>
      )}

      <section className="grid">
        <BridgeCard />
        <TransferCard />
        <BridgeAndExecuteCardOptimism />
        <BridgeAndExecuteCardArbitrum />
        <BridgeAndExecuteCardBaseSplitSupply />
        <BridgeAndExecuteCardBaseMorphoVault />
        <BridgeAndExecuteCardMorphoSplitDeposit />
        <BridgeAndTransferCardBase />
        <BridgeAndSplitCardBase />
      </section>
    </main>
  );
}

