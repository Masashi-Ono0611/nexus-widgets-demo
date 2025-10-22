import React from "react";
import { WalletGroup, WALLET_COLORS } from "../types";

interface TotalsSummaryProps {
  totalAmountComputed: number;
  totalShareValue: number;
  walletGroups: WalletGroup[];
}

export function TotalsSummary({ totalAmountComputed, totalShareValue, walletGroups }: TotalsSummaryProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <div>
          <strong>Total Amount:</strong> {totalAmountComputed ? totalAmountComputed.toFixed(6) : "0"} USDC
        </div>
        <div>
          <strong>Overall Share:</strong> {totalShareValue.toFixed(2)}%
        </div>
      </div>
      <div style={{ height: 10, width: "100%", background: "#eee", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ display: "flex", height: "100%" }}>
          {walletGroups.map((g, gi) => {
            const walletAmount = parseFloat(g.walletAmount) || 0;
            const pct = totalAmountComputed > 0 ? (walletAmount / totalAmountComputed) * 100 : 0;
            return <div key={gi} style={{ width: `${pct}%`, background: WALLET_COLORS[gi % WALLET_COLORS.length] }} />;
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem", fontSize: "0.85rem" }}>
        {walletGroups.map((g, gi) => {
          const walletAmount = parseFloat(g.walletAmount) || 0;
          const pct = totalAmountComputed > 0 ? (walletAmount / totalAmountComputed) * 100 : 0;
          return (
            <div key={gi} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  background: WALLET_COLORS[gi % WALLET_COLORS.length],
                  borderRadius: 2,
                }}
              />
              <span>
                Wallet {gi + 1}: {pct.toFixed(2)}% ({walletAmount ? walletAmount.toFixed(6) : "0"} USDC)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
