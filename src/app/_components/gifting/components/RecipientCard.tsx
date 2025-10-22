import React from "react";
import { RecipientGroup, DeFiStrategy, StrategyAllocation, STRATEGY_COLORS } from "../types";
import { sumPercent } from "../utils";
import { StrategyRow } from "./StrategyRow";

interface RecipientCardProps {
  recipient: RecipientGroup;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onUpdateRecipient: (field: keyof RecipientGroup, value: string) => void;
  onUpdateStrategy: (strategyIndex: number, field: keyof StrategyAllocation, value: string | DeFiStrategy) => void;
  onPresetEvenSplit: () => void;
  onPreset_60_30_10_0: () => void;
  onNormalize: () => void;
}

export function RecipientCard({
  recipient,
  index,
  canRemove,
  onRemove,
  onUpdateRecipient,
  onUpdateStrategy,
  onPresetEvenSplit,
  onPreset_60_30_10_0,
  onNormalize,
}: RecipientCardProps) {
  const strategiesSum = sumPercent(recipient.strategies.map((s) => s.subPercent));
  const recipientSharePercent = parseFloat(recipient.sharePercent) || 0;
  const strategiesSummaryColor = Math.abs(strategiesSum - 100) < 0.01 ? "#2e7d32" : "#d84315";

  return (
    <div style={{ border: "1px solid #ddd", padding: "0.75rem", marginBottom: "0.5rem", borderRadius: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <strong>Recipient {index + 1}</strong>
        {canRemove && (
          <button
            onClick={onRemove}
            className="btn"
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", background: "#ff4444" }}
          >
            Remove
          </button>
        )}
      </div>

      <label className="field">
        <span>Wallet Address</span>
        <input
          type="text"
          placeholder="0x..."
          value={recipient.wallet}
          onChange={(e) => onUpdateRecipient("wallet", e.target.value)}
          className="input"
        />
      </label>

      <label className="field">
        <span>Share Percentage (%)</span>
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={recipient.sharePercent}
          onChange={(e) => onUpdateRecipient("sharePercent", e.target.value)}
          className="input"
        />
      </label>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.35rem" }}>
        <span style={{ fontSize: "0.9rem", color: "#555" }}>Recipient Share</span>
        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{recipientSharePercent.toFixed(2)}%</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.35rem 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong>Strategies</strong>
          <span style={{ fontSize: "0.8rem", color: strategiesSummaryColor }}>Total {strategiesSum.toFixed(2)}%</span>
        </div>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button className="btn" style={{ fontSize: "0.75rem", padding: "0.25rem 0.4rem" }} onClick={onPresetEvenSplit}>
            Even
          </button>
          <button className="btn" style={{ fontSize: "0.75rem", padding: "0.25rem 0.4rem" }} onClick={onPreset_60_30_10_0}>
            60/30/10/0
          </button>
          <button className="btn" style={{ fontSize: "0.75rem", padding: "0.25rem 0.4rem" }} onClick={onNormalize}>
            Normalize 100%
          </button>
        </div>
      </div>

      <div style={{ height: 8, width: "100%", background: "#eee", borderRadius: 4, overflow: "hidden", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", height: "100%" }}>
          {recipient.strategies.map((s, si) => {
            const width = `${parseFloat(s.subPercent) || 0}%`;
            return <div key={si} style={{ width, background: STRATEGY_COLORS[s.strategy] }} />;
          })}
        </div>
      </div>

      {recipient.strategies.map((strategy, si) => (
        <StrategyRow
          key={si}
          strategy={strategy}
          recipientSharePercent={recipientSharePercent}
          onUpdate={(field, value) => onUpdateStrategy(si, field, value)}
        />
      ))}
    </div>
  );
}
