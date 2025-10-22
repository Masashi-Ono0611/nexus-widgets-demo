import React from "react";
import { WalletGroup, DeFiStrategy, StrategyAllocation, STRATEGY_COLORS } from "../types";
import { sumPercent } from "../utils";
import { StrategyRow } from "./StrategyRow";

interface WalletCardProps {
  wallet: WalletGroup;
  index: number;
  totalAmountComputed: number;
  canRemove: boolean;
  onRemove: () => void;
  onUpdateWallet: (field: keyof WalletGroup, value: string) => void;
  onUpdateStrategy: (strategyIndex: number, field: keyof StrategyAllocation, value: string | DeFiStrategy) => void;
  onPresetEvenSplit: () => void;
  onPreset_60_30_10_0: () => void;
  onNormalize: () => void;
}

export function WalletCard({
  wallet,
  index,
  totalAmountComputed,
  canRemove,
  onRemove,
  onUpdateWallet,
  onUpdateStrategy,
  onPresetEvenSplit,
  onPreset_60_30_10_0,
  onNormalize,
}: WalletCardProps) {
  const strategiesSum = sumPercent(wallet.strategies.map((s) => s.subPercent));
  const walletAmount = parseFloat(wallet.walletAmount) || 0;
  const walletOverallPct = totalAmountComputed > 0 ? (walletAmount / totalAmountComputed) * 100 : 0;

  return (
    <div style={{ border: "1px solid #ddd", padding: "0.75rem", marginBottom: "0.5rem", borderRadius: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <strong>Wallet {index + 1}</strong>
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
          value={wallet.wallet}
          onChange={(e) => onUpdateWallet("wallet", e.target.value)}
          className="input"
        />
      </label>

      <label className="field">
        <span>Wallet Amount (USDC)</span>
        <input
          type="number"
          min="0"
          step="0.000001"
          value={wallet.walletAmount}
          onChange={(e) => onUpdateWallet("walletAmount", e.target.value)}
          className="input"
        />
      </label>

      <div style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.25rem" }}>
        Wallet Share: {walletOverallPct.toFixed(2)}%
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.25rem 0" }}>
        <strong>Strategies</strong>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button className="btn" style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }} onClick={onPresetEvenSplit}>
            Even
          </button>
          <button
            className="btn"
            style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
            onClick={onPreset_60_30_10_0}
          >
            60/30/10/0
          </button>
          <button className="btn" style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }} onClick={onNormalize}>
            Normalize 100%
          </button>
        </div>
      </div>

      <div style={{ height: 8, width: "100%", background: "#eee", borderRadius: 4, overflow: "hidden", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", height: "100%" }}>
          {wallet.strategies.map((s, si) => {
            const width = `${parseFloat(s.subPercent) || 0}%`;
            return <div key={si} style={{ width, background: STRATEGY_COLORS[s.strategy] }} />;
          })}
        </div>
      </div>

      {wallet.strategies.map((s, si) => (
        <StrategyRow
          key={si}
          strategy={s}
          walletAmount={walletAmount}
          walletOverallPct={walletOverallPct}
          onUpdate={(field, value) => onUpdateStrategy(si, field, value)}
        />
      ))}
    </div>
  );
}
