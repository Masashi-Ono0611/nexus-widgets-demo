import React from "react";
import { RecipientGroup, DeFiStrategy, StrategyAllocation } from "../types";
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

      <div style={{ marginTop: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Strategies (Total: {strategiesSum.toFixed(2)}%)</span>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              onClick={onPresetEvenSplit}
              className="btn"
              style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
            >
              Even
            </button>
            <button
              onClick={onPreset_60_30_10_0}
              className="btn"
              style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
            >
              60/30/10/0
            </button>
            <button
              onClick={onNormalize}
              className="btn"
              style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
            >
              Normalize
            </button>
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
    </div>
  );
}
