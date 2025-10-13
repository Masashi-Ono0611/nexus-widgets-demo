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
  const { sdk, isSdkInitialized } = useNexus();
  const [balances, setBalances] = React.useState<any | null>(null);
  const [loadingBalances, setLoadingBalances] = React.useState(false);
  const [token, setToken] = React.useState<"ETH" | "USDC" | "USDT">("USDC");
  const [amount, setAmount] = React.useState<string>("100");
  const [toChainId, setToChainId] = React.useState<number>(137); // Polygon as default

  const handleViewBalances = async () => {
    try {
      setLoadingBalances(true);
      const res = await sdk.getUnifiedBalances();
      setBalances(res);
    } catch (e) {
      setBalances({ error: (e as Error).message });
    } finally {
      setLoadingBalances(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Use Avail Nexus
      </h1>

      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12,
        marginBottom: 16,
        alignItems: "end",
      }}>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Token</label>
          <select value={token} onChange={(e) => setToken(e.target.value as any)}
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}>
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Amount</label>
          <input type="number" step="0.000001" value={amount} onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>To Chain ID</label>
          <input type="number" value={toChainId} onChange={(e) => setToChainId(Number(e.target.value))}
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }} />
          <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>e.g. 137: Polygon, 42161: Arbitrum</div>
        </div>
      </section>

      <button
        onClick={handleViewBalances}
        disabled={!isSdkInitialized || loadingBalances}
        style={{
          padding: "10px 16px",
          background: "#ff8a65",
          color: "#fff",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        {loadingBalances ? "Loading…" : "View Unified Balance"}
      </button>

      {balances && (
        <pre
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          {JSON.stringify(balances, null, 2)}
        </pre>
      )}

      <section style={{ display: "grid", gap: 12, marginTop: 24 }}>
        <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Bridge Tokens</h3>
          <BridgeButton prefill={{ chainId: toChainId as any, token: token as any, amount }}>
            {({ onClick, isLoading }) => (
              <button onClick={onClick} disabled={isLoading} style={{ padding: "8px 12px" }}>
                {isLoading ? "Bridging…" : "Open Bridge"}
              </button>
            )}
          </BridgeButton>
        </div>

        <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Transfer Tokens</h3>
          <TransferButton>
            {({ onClick, isLoading }) => (
              <button onClick={onClick} disabled={isLoading} style={{ padding: "8px 12px" }}>
                {isLoading ? "Opening…" : "Open Transfer"}
              </button>
            )}
          </TransferButton>
        </div>

        <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginBottom: 8 }}>{`Bridge & Supply ${token} on AAVE`}</h3>
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
            prefill={{ toChainId: toChainId as any, token: token as any }}
          >
            {({ onClick, isLoading }) => (
              <button onClick={onClick} disabled={isLoading} style={{ padding: "8px 12px" }}>
                {isLoading ? "Processing…" : "Bridge & Stake"}
              </button>
            )}
          </BridgeAndExecuteButton>
        </div>
      </section>
    </main>
  );
}
