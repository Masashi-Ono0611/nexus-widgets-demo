import React from "react";
import { Recipient, DeFiStrategy, STRATEGY_LABELS, STRATEGY_COLORS } from "../types";

interface RecipientCardProps {
  recipient: Recipient;
  index: number;
  onUpdate: (field: keyof Recipient, value: string | DeFiStrategy) => void;
  onRemove: () => void;
}

export function RecipientCard({ recipient, index, onUpdate, onRemove }: RecipientCardProps) {
  return (
    <div style={{ border: "1px solid #ddd", padding: "0.75rem", marginBottom: "0.5rem", borderRadius: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <strong>Recipient {index + 1}</strong>
        <button
          onClick={onRemove}
          className="btn"
          style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", background: "#ff4444" }}
        >
          Remove
        </button>
      </div>

      <label className="field">
        <span>Wallet Address</span>
        <input
          type="text"
          placeholder="0x..."
          value={recipient.wallet}
          onChange={(e) => onUpdate("wallet", e.target.value)}
          className="input"
        />
      </label>

      <label className="field" style={{ marginTop: "0.75rem" }}>
        <span>Share Percentage (%)</span>
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={recipient.sharePercent}
          onChange={(e) => onUpdate("sharePercent", e.target.value)}
          className="input"
        />
      </label>

      <div className="field">
        <span>Strategy</span>
        <div className="input" style={{ display: "flex", alignItems: "center", height: "36px", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              background: STRATEGY_COLORS[recipient.strategy],
              borderRadius: 3,
            }}
          />
          {STRATEGY_LABELS[recipient.strategy]}
        </div>
      </div>
    </div>
  );
}
