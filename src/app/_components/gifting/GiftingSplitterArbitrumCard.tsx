"use client";
import React, { useMemo } from "react";
import { DeFiStrategy, Recipient, RecipientGroup, StrategyAllocation } from "./types";
import { RecipientCard } from "./components/RecipientCard";
import { TotalsSummary } from "./components/TotalsSummary";
import { ValidationMessages } from "./components/ValidationMessages";
import { ConfigManager } from "./components/ConfigManager";
import { ToastProvider } from "../common/ToastProvider";
import { useToast } from "../common/ToastProvider";
import { useGiftingConfig } from "./hooks/useGiftingConfig";
import { GiftingExecuteButton } from "./components/GiftingExecuteButton";

type CardModeProps = { executeOnly?: boolean };

function GiftingSplitterArbitrumCardInner({ executeOnly }: CardModeProps) {
  const { showSuccess } = useToast();
  const {
    recipientGroups,
    setRecipientGroups,
    flatRecipients,
    validationMessages,
    isValid,
    prefillConfig,
    buildFunctionParams,
    onLoadConfig,
    currentId,
    isLoadingConfig,
    notFound,
  } = useGiftingConfig();

  const handleLoadConfig = (loadedRecipients: Recipient[]) => onLoadConfig(loadedRecipients);

  const addRecipientGroup = () => {
    if (recipientGroups.length >= 5 || flatRecipients.length >= 20) {
      alert("Maximum 5 recipient groups or 20 total recipients");
      return;
    }
    setRecipientGroups([
      ...recipientGroups,
      {
        wallet: "",
        sharePercent: "0",
        strategies: [
          { strategy: DeFiStrategy.DIRECT_TRANSFER, subPercent: "100" },
          { strategy: DeFiStrategy.AAVE_SUPPLY, subPercent: "0" },
          { strategy: DeFiStrategy.MORPHO_DEPOSIT, subPercent: "0" },
          { strategy: DeFiStrategy.UNISWAP_V2_SWAP, subPercent: "0" },
        ],
      },
    ]);
  };

  const removeRecipientGroup = (index: number) => {
    if (recipientGroups.length <= 1) {
      if (recipientGroups.length === 1) {
        alert("At least one recipient required");
      }
      return;
    }
    setRecipientGroups(recipientGroups.filter((_, i) => i !== index));
  };

  const updateRecipientField = (index: number, field: keyof RecipientGroup, value: string) => {
    const updated = [...recipientGroups];
    (updated[index] as any)[field] = value;
    setRecipientGroups(updated);
  };

  const updateStrategyField = (
    recipientIndex: number,
    strategyIndex: number,
    field: keyof StrategyAllocation,
    value: string | DeFiStrategy
  ) => {
    const updated = [...recipientGroups];
    if (field === "strategy") {
      updated[recipientIndex].strategies[strategyIndex][field] = value as DeFiStrategy;
    } else {
      updated[recipientIndex].strategies[strategyIndex][field] = value as string;
    }
    setRecipientGroups(updated);
  };

  const presetEvenSplit = (recipientIndex: number) => {
    const updated = [...recipientGroups];
    const n = updated[recipientIndex].strategies.length;
    const base = Math.floor(10000 / n) / 100;
    const remainder = 100 - base * (n - 1);
    updated[recipientIndex].strategies = updated[recipientIndex].strategies.map((s, i) => ({
      ...s,
      subPercent: String(i === n - 1 ? remainder : base),
    }));
    setRecipientGroups(updated);
  };

  const preset_60_30_10_0 = (recipientIndex: number) => {
    const updated = [...recipientGroups];
    const arr = [60, 30, 10, 0];
    updated[recipientIndex].strategies = updated[recipientIndex].strategies.map((s, i) => ({
      ...s,
      subPercent: String(arr[i] ?? 0),
    }));
    setRecipientGroups(updated);
  };

  const normalizeStrategies = (recipientIndex: number) => {
    const updated = [...recipientGroups];
    const sum = updated[recipientIndex].strategies.reduce((s, x) => s + (parseFloat(x.subPercent) || 0), 0);
    if (sum <= 0) {
      presetEvenSplit(recipientIndex);
      return;
    }
    updated[recipientIndex].strategies = updated[recipientIndex].strategies.map((s) => ({
      ...s,
      subPercent: String(((parseFloat(s.subPercent) || 0) / sum) * 100),
    }));
    setRecipientGroups(updated);
  };

  return (
    <div className="card">
      {!executeOnly && <h3>Gifting Splitter (Arbitrum Sepolia)</h3>}

      {executeOnly && isLoadingConfig && (
        <div style={{ marginBottom: "0.5rem", color: "#666" }}>Loading configuration...</div>
      )}
      {executeOnly && !isLoadingConfig && notFound && (
        <div style={{ marginBottom: "0.5rem", color: "#c62828" }}>Configuration not found{currentId ? ` (ID: ${currentId})` : ""}</div>
      )}

      {!executeOnly && <TotalsSummary recipientGroups={recipientGroups} />}

      {!executeOnly && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <strong>Recipients ({recipientGroups.length}/5)</strong>
          </div>

          {recipientGroups.map((recipient, index) => (
            <RecipientCard
              key={index}
              recipient={recipient}
              index={index}
              canRemove={recipientGroups.length > 1}
              onRemove={() => removeRecipientGroup(index)}
              onUpdateRecipient={(field, value) => updateRecipientField(index, field, value)}
              onUpdateStrategy={(si, field, value) => updateStrategyField(index, si, field, value)}
              onPresetEvenSplit={() => presetEvenSplit(index)}
              onPreset_60_30_10_0={() => preset_60_30_10_0(index)}
              onNormalize={() => normalizeStrategies(index)}
            />
          ))}

          <button
            onClick={addRecipientGroup}
            disabled={recipientGroups.length >= 5 || flatRecipients.length >= 20}
            className="btn"
            style={{
              width: "100%",
              marginTop: "0.5rem",
              background: "#4CAF50",
              opacity: recipientGroups.length >= 5 || flatRecipients.length >= 20 ? 0.6 : 1,
            }}
          >
            + Add Recipient
          </button>
        </div>
      )}

      {!executeOnly && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <ConfigManager recipients={flatRecipients} onLoadConfig={handleLoadConfig} />
        </div>
      )}

      {!executeOnly && currentId && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "0.75rem",
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          marginBottom: "0.75rem",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Share receive link</div>
            <div style={{ fontSize: 12, color: "#666", wordBreak: "break-all" }}>
              {typeof window !== "undefined" ? `${window.location.origin}/gifting/${currentId}/receive` : `/gifting/${currentId}/receive`}
            </div>
            <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
              <button
                className="btn"
                style={{ background: "#2196F3" }}
                onClick={() => {
                  const href = typeof window !== "undefined" ? `${window.location.origin}/gifting/${currentId}/receive` : `/gifting/${currentId}/receive`;
                  navigator.clipboard?.writeText(href).then(() => {
                    showSuccess("Link copied to clipboard");
                  });
                }}
              >
                Copy link
              </button>
            </div>
          </div>
          <div style={{ width: 120, height: 120, flex: "0 0 auto" }}>
            <img
              alt="QR"
              style={{ width: 120, height: 120 }}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/gifting/${currentId}/receive` : `/gifting/${currentId}/receive`)}`}
            />
          </div>
        </div>
      )}

      <GiftingExecuteButton isValid={isValid} prefill={prefillConfig} buildFunctionParams={buildFunctionParams} />

      {!executeOnly && <ValidationMessages messages={validationMessages} />}
    </div>
  );
}

export function GiftingSplitterArbitrumCard() {
  return (
    <ToastProvider>
      <GiftingSplitterArbitrumCardInner />
    </ToastProvider>
  );
}

export function GiftingSplitterArbitrumExecuteOnlyCard() {
  return (
    <ToastProvider>
      <GiftingSplitterArbitrumCardInner executeOnly />
    </ToastProvider>
  );
}
