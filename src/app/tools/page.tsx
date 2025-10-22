"use client";
import React from "react";
import { useNexus } from "@avail-project/nexus-widgets";
import { BridgeCard } from "../_components/common/BridgeCard";
import { TransferCard } from "../_components/transfer/TransferCard";
import { SupplyArbitrumCard } from "../_components/aave/SupplyArbitrumCard";
import { SplitSupplyArbitrumCard } from "../_components/aave/SplitSupplyArbitrumCard";
import { MorphoSupplyArbitrumCard } from "../_components/morpho/MorphoSupplyArbitrumCard";
import { MorphoSplitDepositArbitrumCard } from "../_components/morpho/MorphoSplitDepositArbitrumCard";
import { TransferBaseCard } from "../_components/transfer/TransferBaseCard";
import { TransferSplitBaseCard } from "../_components/splitter/TransferSplitBaseCard";
import { DelayedTransferBaseCard } from "../_components/scheduled/DelayedTransferBaseCard";
import { FlexibleSplitterArbitrumCard } from "../_components/splitter/FlexibleSplitterArbitrumCard";
import { RecurringSplitterArbitrumCard } from "../_components/scheduled/RecurringSplitterArbitrumCard";
import { PayrollRecurringSplitterArbitrumCard } from "../_components/scheduled/PayrollRecurringSplitterArbitrumCard";

export default function ToolsPage() {
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
      <div>
        <p className="subheader-main">
          Explore cross-chain DeFi operations with seamless token bridging, lending, and yield farming across multiple networks.
        </p>
      </div>

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
        <pre className="pre">{JSON.stringify(balances, null, 2)}</pre>
      )}

      <section className="grid">
        <BridgeCard />
        <TransferCard />
        <TransferBaseCard />
        <TransferSplitBaseCard />
        <SupplyArbitrumCard />
        <SplitSupplyArbitrumCard />
        <MorphoSupplyArbitrumCard />
        <MorphoSplitDepositArbitrumCard />
        <DelayedTransferBaseCard />
        <FlexibleSplitterArbitrumCard />
        <RecurringSplitterArbitrumCard />
        <PayrollRecurringSplitterArbitrumCard />
      </section>
    </main>
  );
}
