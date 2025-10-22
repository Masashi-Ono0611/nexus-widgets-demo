import React from "react";
import { DeFiStrategy, StrategyAllocation, STRATEGY_LABELS, STRATEGY_COLORS } from "../types";

interface StrategyRowProps {
  strategy: StrategyAllocation;
  recipientSharePercent: number;
  onUpdate: (field: keyof StrategyAllocation, value: string | DeFiStrategy) => void;
}

export function StrategyRow({ strategy, recipientSharePercent, onUpdate }: StrategyRowProps) {
  const sub = parseFloat(strategy.subPercent) || 0;
  const overall = (recipientSharePercent * sub) / 100;
  const overallLabel = overall.toFixed(2);
  const subLabel = sub.toFixed(2);

  return (
    <div style={{ border: "1px solid #eee", padding: "0.6rem", marginBottom: "0.5rem", borderRadius: "4px" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "stretch" }}>
        <div className="field" style={{ flex: 1 }}>
          <span>Strategy</span>
          <div className="input" style={{ display: "flex", alignItems: "center", height: "36px", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                background: STRATEGY_COLORS[strategy.strategy],
                borderRadius: 3,
              }}
            />
            {STRATEGY_LABELS[strategy.strategy]}
          </div>
        </div>

        <label className="field" style={{ width: "180px" }}>
          <span>Sub Percentage (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={strategy.subPercent}
            onChange={(e) => onUpdate("subPercent", e.target.value)}
            className="input"
          />
        </label>
      </div>

      <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>
        Sub allocation {subLabel}% × Recipient share {recipientSharePercent.toFixed(2)}% = Overall allocation {overallLabel}%
      </div>
    </div>
  );
}
