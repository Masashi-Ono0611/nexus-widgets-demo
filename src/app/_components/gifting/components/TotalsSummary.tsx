import React from "react";
import { RecipientGroup, RECIPIENT_COLORS, STRATEGY_COLORS, STRATEGY_LABELS } from "../types";
import { sumPercent } from "../utils";

const PIE_SIZE = 96;
const PIE_RADIUS = PIE_SIZE / 2 - 4;

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

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
        const overallSegments = group.strategies.map((strategyAllocation) => {
          const sub = parseFloat(strategyAllocation.subPercent) || 0;
          const overall = (share * sub) / 100;
          return {
            strategy: strategyAllocation.strategy,
            sub,
            overall,
          };
        });

        let cumulativeAngle = 0;

        return (
          <div key={index} style={{ marginBottom: "1rem" }}>
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

            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <svg width={PIE_SIZE} height={PIE_SIZE} viewBox={`0 0 ${PIE_SIZE} ${PIE_SIZE}`}>
                <circle cx={PIE_SIZE / 2} cy={PIE_SIZE / 2} r={PIE_RADIUS} fill="#f5f5f5" />
                {overallSegments.map((segment, si) => {
                  const angle = (segment.sub / 100) * 360;
                  if (angle <= 0) {
                    return null;
                  }
                  const path = describeArc(
                    PIE_SIZE / 2,
                    PIE_SIZE / 2,
                    PIE_RADIUS,
                    cumulativeAngle,
                    cumulativeAngle + angle
                  );
                  const element = (
                    <path key={si} d={path} fill={STRATEGY_COLORS[segment.strategy]} stroke="#fff" strokeWidth={1} />
                  );
                  cumulativeAngle += angle;
                  return element;
                })}
              </svg>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.85rem", minWidth: "200px" }}>
                {overallSegments.map((segment, si) => (
                  <div key={si} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        background: STRATEGY_COLORS[segment.strategy],
                        borderRadius: 2,
                      }}
                    />
                    <span style={{ flex: 1 }}>{STRATEGY_LABELS[segment.strategy]}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      {segment.sub.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
