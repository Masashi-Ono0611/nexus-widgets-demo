"use client";
import type { ReactNode } from "react";
import React from "react";
import { WagmiProvider } from "wagmi";
import { sepolia, baseSepolia, arbitrumSepolia, optimismSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { NexusProvider, useNexus } from "@avail-project/nexus-widgets";

// Wagmi v2 + RainbowKit v2 configuration
const config = getDefaultConfig({
  appName: "Avail Nexus - Cross-Chain DeFi Hub",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo-project-id",
  chains: [sepolia, baseSepolia, arbitrumSepolia, optimismSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

function WalletBridge() {
  const { setProvider } = useNexus();
  React.useEffect(() => {
    const eth: any = (globalThis as any).ethereum;
    if (eth) setProvider(eth);
  }, [setProvider]);
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NexusProvider config={{ network: "testnet", debug: false }}>
            <WalletBridge />
            {children}
          </NexusProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
