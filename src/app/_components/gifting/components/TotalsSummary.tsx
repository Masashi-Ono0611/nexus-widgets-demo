import React from "react";
import { Recipient, RECIPIENT_COLORS } from "../types";

interface TotalsSummaryProps {
  recipients: Recipient[];
  totalAmount: string;
}

export function TotalsSummary({ recipients, totalAmount }: TotalsSummaryProps) {
  const total = parseFloat(totalAmount) || 0;
  const totalPct = recipients.reduce((sum, r) => sum + (parseFloat(r.sharePercent) || 0), 0);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>Total Amount:</strong> {total ? total.toFixed(6) : "0"} USDC
      </div>
      <div style={{ height: 10, width: "100%", background: "#eee", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ display: "flex", height: "100%" }}>
          {recipients.map((r, i) => {
            const pct = parseFloat(r.sharePercent) || 0;
            return <div key={i} style={{ width: `${pct}%`, background: RECIPIENT_COLORS[i % RECIPIENT_COLORS.length] }} />;
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem", fontSize: "0.85rem" }}>
        {recipients.map((r, i) => {
          const pct = parseFloat(r.sharePercent) || 0;
          const amount = (total * pct) / 100;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  background: RECIPIENT_COLORS[i % RECIPIENT_COLORS.length],
                  borderRadius: 2,
                }}
              />
              <span>
                Recipient {i + 1}: {amount ? amount.toFixed(6) : "0"} USDC ({pct.toFixed(2)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
