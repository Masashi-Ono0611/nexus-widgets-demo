"use client";
import React from "react";
import { NexusProvider, useNexus } from "@avail-project/nexus-widgets";

function WalletBridge() {
  const { setProvider } = useNexus();
  React.useEffect(() => {
    const eth: any = (globalThis as any).ethereum;
    if (eth) setProvider(eth);
  }, [setProvider]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NexusProvider config={{ network: "testnet", debug: false }}>
      <WalletBridge />
      {children}
    </NexusProvider>
  );
}
