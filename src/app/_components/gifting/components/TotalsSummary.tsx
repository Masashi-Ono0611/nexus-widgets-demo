import React from "react";
import { RecipientGroup, RECIPIENT_COLORS, STRATEGY_COLORS, STRATEGY_LABELS } from "../types";
import { sumPercent } from "../utils";

interface TotalsSummaryProps {
  recipientGroups: RecipientGroup[];
}

export function TotalsSummary({ recipientGroups }: TotalsSummaryProps) {
  const recipientTotal = sumPercent(recipientGroups.map((g) => g.sharePercent));

  return (
    <div style={{ marginBottom: "1.5rem", border: "1px solid #e0e0e0", borderRadius: 6, padding: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <strong>Recipient Allocation Overview</strong>
        <span style={{ fontSize: "0.85rem", color: recipientTotal === 100 ? "#2e7d32" : "#d84315" }}>
          Total: {recipientTotal.toFixed(2)}% (target 100%)
        </span>
      </div>

      <div style={{ height: 10, width: "100%", background: "#eee", borderRadius: 4, overflow: "hidden", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", height: "100%" }}>
          {recipientGroups.map((group, index) => {
            const pct = parseFloat(group.sharePercent) || 0;
            return <div key={index} style={{ width: `${pct}%`, background: RECIPIENT_COLORS[index % RECIPIENT_COLORS.length] }} />;
          })}
        </div>
      </div>

      {recipientGroups.length === 0 && (
        <div style={{ fontSize: "0.9rem", color: "#666" }}>Add recipients to begin configuring allocations.</div>
      )}

      {recipientGroups.map((group, index) => {
        const share = parseFloat(group.sharePercent) || 0;
        const strategiesTotal = sumPercent(group.strategies.map((s) => s.subPercent));
        return (
          <div key={index} style={{ marginBottom: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.35rem" }}>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  background: RECIPIENT_COLORS[index % RECIPIENT_COLORS.length],
                  borderRadius: 2,
                }}
              />
              <strong>
                Recipient {index + 1}: {share.toFixed(2)}%
              </strong>
              <span style={{ fontSize: "0.85rem", color: "#777" }}>{group.wallet ? group.wallet : "Wallet not set"}</span>
              <span style={{ fontSize: "0.8rem", color: strategiesTotal === 100 ? "#2e7d32" : "#d84315" }}>
                Sub Total: {strategiesTotal.toFixed(2)}%
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {group.strategies.map((strategyAllocation, si) => {
                const sub = parseFloat(strategyAllocation.subPercent) || 0;
                const overall = (share * sub) / 100;
                return (
                  <span
                    key={si}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0.25rem 0.5rem",
                      borderRadius: 4,
                      background: "#f5f5f5",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        background: STRATEGY_COLORS[strategyAllocation.strategy],
                        borderRadius: 2,
                      }}
                    />
                    {STRATEGY_LABELS[strategyAllocation.strategy]}: {sub.toFixed(2)}% (overall {overall.toFixed(2)}%)
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
