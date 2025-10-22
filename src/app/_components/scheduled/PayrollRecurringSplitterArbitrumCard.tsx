"use client";
import React, { useMemo, useState } from "react";
import {
  BridgeAndExecuteButton,
  TOKEN_CONTRACT_ADDRESSES,
  TOKEN_METADATA,
} from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";

const RECURRING_SPLITTER_ADDRESS = "0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E";
const FLEXIBLE_SPLITTER_ADDRESS = "0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454";

// DeFi Strategy enum (must match contract)
enum DeFiStrategy {
  DIRECT_TRANSFER = 0,
  AAVE_SUPPLY = 1,
  MORPHO_DEPOSIT = 2,
  UNISWAP_V2_SWAP = 3,
}

interface Recipient {
  wallet: string;
  sharePercent: string;
  strategy: DeFiStrategy;
}

const STRATEGY_LABELS = {
  [DeFiStrategy.DIRECT_TRANSFER]: "Direct Transfer",
  [DeFiStrategy.AAVE_SUPPLY]: "AAVE Supply",
  [DeFiStrategy.MORPHO_DEPOSIT]: "Morpho Deposit",
  [DeFiStrategy.UNISWAP_V2_SWAP]: "Uniswap V2 Swap (USDC→WETH)",
};

const STRATEGY_COLORS: Record<number, string> = {
  [DeFiStrategy.DIRECT_TRANSFER]: "#4CAF50",
  [DeFiStrategy.AAVE_SUPPLY]: "#1976D2",
  [DeFiStrategy.MORPHO_DEPOSIT]: "#8E24AA",
  [DeFiStrategy.UNISWAP_V2_SWAP]: "#F57C00",
};

const WALLET_COLORS = ["#1565C0", "#2E7D32", "#EF6C00", "#6A1B9A", "#00838F"];

// helpers
function isValidAddress(addr: string) {
  return !!addr && addr.startsWith("0x") && addr.length === 42;
}

function toContractRecipients(recipients: Recipient[]) {
  return recipients.map((r) => ({
    wallet: r.wallet as `0x${string}`,
    sharePercent: Math.round(parseFloat(r.sharePercent || "0") * 100),
    strategy: r.strategy,
  }));
}

function totalShare(recipients: Recipient[]) {
  return recipients.reduce((sum, r) => sum + (parseFloat(r.sharePercent) || 0), 0);
}

// Hierarchical UI types
interface StrategyAllocation { strategy: DeFiStrategy; subPercent: string }
interface WalletGroup { wallet: string; walletAmount: string; strategies: StrategyAllocation[] }

function sumPercent(values: string[]) {
  return values.reduce((s, v) => s + (parseFloat(v) || 0), 0);
}

function buildFlatRecipientsFromGroups(groups: WalletGroup[], totalAmount: number): Recipient[] {
  const result: Recipient[] = [];
  if (!totalAmount || totalAmount <= 0) return result;
  for (const g of groups) {
    const walletAmt = parseFloat(g.walletAmount) || 0;
    const walletPct = (walletAmt / totalAmount) * 100; // wallet share in %
    for (const s of g.strategies) {
      const sub = parseFloat(s.subPercent) || 0;
      const overallPercent = (walletPct * sub) / 100; // overall % of total
      if (overallPercent > 0) {
        result.push({
          wallet: g.wallet,
          sharePercent: overallPercent.toString(),
          strategy: s.strategy,
        });
      }
    }
  }
  return result;
}

export function PayrollRecurringSplitterArbitrumCard() {
  const [walletGroups, setWalletGroups] = useState<WalletGroup[]>([
    {
      wallet: "",
      walletAmount: "",
      strategies: [
        { strategy: DeFiStrategy.DIRECT_TRANSFER, subPercent: "60" },
        { strategy: DeFiStrategy.AAVE_SUPPLY, subPercent: "30" },
        { strategy: DeFiStrategy.MORPHO_DEPOSIT, subPercent: "10" },
        { strategy: DeFiStrategy.UNISWAP_V2_SWAP, subPercent: "0" },
      ],
    },
  ]);

  const [intervalMinutes, setIntervalMinutes] = useState("60");
  const [maxExecutions, setMaxExecutions] = useState("3");
  // OFF = Flexible (immediate), ON = Recurring (schedule)
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  const addWalletGroup = () => {
    if (walletGroups.length >= 5) {
      alert("Maximum 5 wallets allowed");
      return;
    }
    setWalletGroups([
      ...walletGroups,
      {
        wallet: "",
        walletAmount: "",
        strategies: [
          { strategy: DeFiStrategy.DIRECT_TRANSFER, subPercent: "100" },
          { strategy: DeFiStrategy.AAVE_SUPPLY, subPercent: "0" },
          { strategy: DeFiStrategy.MORPHO_DEPOSIT, subPercent: "0" },
          { strategy: DeFiStrategy.UNISWAP_V2_SWAP, subPercent: "0" },
        ],
      },
    ]);
  };

  const removeWalletGroup = (index: number) => {
    if (walletGroups.length <= 1) {
      alert("At least one wallet required");
      return;
    }
    setWalletGroups(walletGroups.filter((_, i) => i !== index));
  };

  const updateWalletField = (index: number, field: keyof WalletGroup, value: string) => {
    const updated = [...walletGroups];
    (updated[index] as any)[field] = value;
    setWalletGroups(updated);
  };

  const updateStrategyField = (
    walletIndex: number,
    strategyIndex: number,
    field: keyof StrategyAllocation,
    value: string | DeFiStrategy
  ) => {
    const updated = [...walletGroups];
    if (field === "strategy") {
      updated[walletIndex].strategies[strategyIndex][field] = value as DeFiStrategy;
    } else {
      updated[walletIndex].strategies[strategyIndex][field] = value as string;
    }
    setWalletGroups(updated);
  };

  const presetEvenSplit = (walletIndex: number) => {
    const updated = [...walletGroups];
    const n = updated[walletIndex].strategies.length;
    const base = Math.floor((10000 / n)) / 100;
    const remainder = 100 - base * (n - 1);
    updated[walletIndex].strategies = updated[walletIndex].strategies.map((s, i) => ({ ...s, subPercent: String(i === n - 1 ? remainder : base) }));
    setWalletGroups(updated);
  };

  const preset_60_30_10_0 = (walletIndex: number) => {
    const updated = [...walletGroups];
    const arr = [60, 30, 10, 0];
    updated[walletIndex].strategies = updated[walletIndex].strategies.map((s, i) => ({ ...s, subPercent: String(arr[i] ?? 0) }));
    setWalletGroups(updated);
  };

  const normalizeStrategies = (walletIndex: number) => {
    const updated = [...walletGroups];
    const sum = updated[walletIndex].strategies.reduce((s, x) => s + (parseFloat(x.subPercent) || 0), 0);
    if (sum <= 0) {
      presetEvenSplit(walletIndex);
      return;
    }
    updated[walletIndex].strategies = updated[walletIndex].strategies.map((s) => ({
      ...s,
      subPercent: String(((parseFloat(s.subPercent) || 0) / sum) * 100),
    }));
    setWalletGroups(updated);
  };

  const totalAmountComputed = useMemo(() => walletGroups.reduce((s, g) => s + (parseFloat(g.walletAmount) || 0), 0), [walletGroups]);
  const totalWalletPercent = useMemo(() => {
    // Derived: sum of wallet % equals 100% if amounts entered
    return totalAmountComputed > 0
      ? walletGroups.reduce((s, g) => s + (((parseFloat(g.walletAmount) || 0) / totalAmountComputed) * 100), 0)
      : 0;
  }, [walletGroups, totalAmountComputed]);
  const flatRecipients = useMemo(() => buildFlatRecipientsFromGroups(walletGroups, totalAmountComputed), [walletGroups, totalAmountComputed]);
  const totalShareValue = useMemo(() => totalShare(flatRecipients), [flatRecipients]);

  const prefillConfig = useMemo(() => {
    const base = { toChainId: 421614 as const, token: "USDC" as const };
    if (totalAmountComputed && totalAmountComputed > 0) {
      return { ...base, amount: String(totalAmountComputed) };
    }
    return base;
  }, [totalAmountComputed]);

  const isValidConfiguration = () => {
    const recipientsOk = walletGroups.every((g) => isValidAddress(g.wallet));
    const shareOk = Math.abs(totalShareValue - 100) < 0.01;
    // also require wallets total = 100 and each wallet strategies = 100
    const walletsTotalOk = Math.abs(totalWalletPercent - 100) < 0.01;
    const eachWalletOk = walletGroups.every((g) => Math.abs(sumPercent(g.strategies.map((s) => s.subPercent)) - 100) < 0.01);
    const recipientCountOk = flatRecipients.length <= 20;
    if (!scheduleEnabled) return recipientsOk && shareOk && walletsTotalOk && eachWalletOk && recipientCountOk;
    const interval = parseInt(intervalMinutes);
    const maxExec = parseInt(maxExecutions);
    const validInterval = interval >= 1 && interval <= 525600;
    const validMaxExecutions = maxExec >= 0 && maxExec <= 1000;
    return recipientsOk && shareOk && walletsTotalOk && eachWalletOk && recipientCountOk && validInterval && validMaxExecutions;
  };

  const validationMessages: string[] = [];
  if (totalAmountComputed <= 0) validationMessages.push("Enter wallet amounts (USDC) to compute total");
  if (Math.abs(totalWalletPercent - 100) >= 0.01) validationMessages.push("Wallets Total must be 100%");
  walletGroups.forEach((g, i) => {
    const s = sumPercent(g.strategies.map((x) => x.subPercent));
    if (Math.abs(s - 100) >= 0.01) validationMessages.push(`Wallet ${i + 1}: Strategies Total must be 100%`);
    if (!isValidAddress(g.wallet)) validationMessages.push(`Wallet ${i + 1}: Invalid address`);
  });
  if (flatRecipients.length > 20) validationMessages.push("Recipients exceed 20");

  return (
    <div className="card">
      <h3>Recurring Token Splitter (Arbitrum Sepolia) 🔄</h3>

      {/* Totals Summary */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <div><strong>Total Amount:</strong> {totalAmountComputed ? totalAmountComputed.toFixed(6) : "0"} USDC</div>
          <div><strong>Overall Share:</strong> {totalShareValue.toFixed(2)}%</div>
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
            return <div key={gi} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, background: WALLET_COLORS[gi % WALLET_COLORS.length], borderRadius: 2 }} />
              <span>Wallet {gi + 1}: {pct.toFixed(2)}% ({walletAmount ? walletAmount.toFixed(6) : "0"} USDC)</span>
            </div>;
          })}
        </div>
      </div>

      {/* Recipients Configuration (Wallet -> Strategies) */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <strong>Wallet Allocations ({walletGroups.length}/5)</strong>
        </div>
        {walletGroups.map((g, gi) => {
          const strategiesSum = sumPercent(g.strategies.map((s) => s.subPercent));
          const walletAmount = parseFloat(g.walletAmount) || 0;
          const walletOverallPct = totalAmountComputed > 0 ? (walletAmount / totalAmountComputed) * 100 : 0;
          return (
            <div key={gi} style={{ border: "1px solid #ddd", padding: "0.75rem", marginBottom: "0.5rem", borderRadius: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong>Wallet {gi + 1}</strong>
                {walletGroups.length > 1 && (
                  <button onClick={() => removeWalletGroup(gi)} className="btn" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", background: "#ff4444" }}>Remove</button>
                )}
              </div>

              <label className="field">
                <span>Wallet Address</span>
                <input type="text" placeholder="0x..." value={g.wallet} onChange={(e) => updateWalletField(gi, "wallet", e.target.value)} className="input" />
              </label>

              <label className="field">
                <span>Wallet Amount (USDC)</span>
                <input type="number" min="0" step="0.000001" value={g.walletAmount} onChange={(e) => updateWalletField(gi, "walletAmount", e.target.value)} className="input" />
              </label>

              <div style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.25rem" }}>Wallet Share: {walletOverallPct.toFixed(2)}%</div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.25rem 0" }}>
                <strong>Strategies (fixed 4)</strong>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button className="btn" style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }} onClick={() => presetEvenSplit(gi)}>Even</button>
                  <button className="btn" style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }} onClick={() => preset_60_30_10_0(gi)}>60/30/10/0</button>
                  <button className="btn" style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }} onClick={() => normalizeStrategies(gi)}>Normalize 100%</button>
                </div>
              </div>

              <div style={{ height: 8, width: "100%", background: "#eee", borderRadius: 4, overflow: "hidden", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", height: "100%" }}>
                  {g.strategies.map((s, si) => {
                    const width = `${(parseFloat(s.subPercent) || 0)}%`;
                    return <div key={si} style={{ width, background: STRATEGY_COLORS[s.strategy] }} />;
                  })}
                </div>
              </div>

              {g.strategies.map((s, si) => {
                const sub = parseFloat(s.subPercent) || 0;
                const overall = (walletOverallPct * sub) / 100;
                const strategyAmount = walletAmount * sub / 100;
                return (
                  <div key={si} style={{ border: "1px solid #eee", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <div className="field" style={{ flex: 1 }}>
                        <span>Strategy</span>
                        <div className="input" style={{ display: "flex", alignItems: "center", height: "36px", gap: 8 }}>
                          <span style={{ display: "inline-block", width: 12, height: 12, background: STRATEGY_COLORS[s.strategy], borderRadius: 3 }} />
                          {STRATEGY_LABELS[s.strategy]}
                        </div>
                      </div>

                      <label className="field" style={{ width: "200px" }}>
                        <span>Sub Percentage (%)</span>
                        <input type="number" min="0" max="100" step="0.01" value={s.subPercent} onChange={(e) => updateStrategyField(gi, si, "subPercent", e.target.value)} className="input" />
                      </label>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "#555", marginTop: "0.25rem" }}>Overall: {overall.toFixed(2)}% of total · Amount: {strategyAmount ? strategyAmount.toFixed(6) : "0"} USDC</div>
                  </div>
                );
              })}

              </div>
          );
        })}

        <button onClick={addWalletGroup} disabled={walletGroups.length >= 5 || flatRecipients.length >= 20} className="btn" style={{ width: "100%", marginTop: "0.5rem", background: "#4CAF50", opacity: (walletGroups.length >= 5 || flatRecipients.length >= 20) ? 0.6 : 1 }}>+ Add Wallet</button>
      </div>

      {/* Execution Mode */}
      <div style={{ margin: "1.25rem 0", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "0.75rem", background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <strong>Execution Mode</strong>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              background: scheduleEnabled ? "#E3F2FD" : "#E8F5E9",
              color: scheduleEnabled ? "#0D47A1" : "#1B5E20",
            }}
          >
            {scheduleEnabled ? "Recurring Schedule" : "Immediate Transfer"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: scheduleEnabled ? "0.75rem" : 0 }}>
          <button
            type="button"
            onClick={() => setScheduleEnabled(false)}
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #1565C0",
              background: scheduleEnabled ? "#ffffff" : "#1565C0",
              color: scheduleEnabled ? "#1565C0" : "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Immediate
          </button>
          <button
            type="button"
            onClick={() => setScheduleEnabled(true)}
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #1565C0",
              background: scheduleEnabled ? "#1565C0" : "#ffffff",
              color: scheduleEnabled ? "#ffffff" : "#1565C0",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Recurring
          </button>
        </div>
        {scheduleEnabled && (
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
          >
            <label className="field" style={{ margin: 0 }}>
              <span>Interval (minutes)</span>
              <input
                type="number"
                min="1"
                max="525600"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(e.target.value)}
                className="input"
                placeholder="60 = 1 hour, 1440 = 1 day"
              />
            </label>
            <label className="field" style={{ margin: 0 }}>
              <span>Max Executions (0 = unlimited)</span>
              <input
                type="number"
                min="0"
                max="1000"
                value={maxExecutions}
                onChange={(e) => setMaxExecutions(e.target.value)}
                className="input"
              />
            </label>
          </div>
        )}
      </div>

      <BridgeAndExecuteButton
        contractAddress={scheduleEnabled ? RECURRING_SPLITTER_ADDRESS : FLEXIBLE_SPLITTER_ADDRESS}
        contractAbi={
          scheduleEnabled
            ? ([
                {
                  name: "createSchedule",
                  type: "function",
                  stateMutability: "nonpayable",
                  inputs: [
                    { name: "asset", type: "address" },
                    { name: "amountPerExecution", type: "uint256" },
                    {
                      name: "recipients",
                      type: "tuple[]",
                      components: [
                        { name: "wallet", type: "address" },
                        { name: "sharePercent", type: "uint16" },
                        { name: "strategy", type: "uint8" },
                      ],
                    },
                    { name: "intervalSeconds", type: "uint256" },
                    { name: "maxExecutions", type: "uint256" },
                  ],
                  outputs: [{ name: "scheduleId", type: "uint256" }],
                },
              ] as const)
            : ([
                {
                  name: "distributeTokens",
                  type: "function",
                  stateMutability: "nonpayable",
                  inputs: [
                    { name: "asset", type: "address" },
                    { name: "amount", type: "uint256" },
                    {
                      name: "recipients",
                      type: "tuple[]",
                      components: [
                        { name: "wallet", type: "address" },
                        { name: "sharePercent", type: "uint16" },
                        { name: "strategy", type: "uint8" },
                      ],
                    },
                  ],
                  outputs: [],
                },
              ] as const)
        }
        functionName={scheduleEnabled ? "createSchedule" : "distributeTokens"}
        prefill={prefillConfig}
        buildFunctionParams={(token, amount, chainId, userAddress) => {
          const decimals = TOKEN_METADATA[token].decimals;
          const totalAmountWei = parseUnits(amount, decimals);
          const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];

          const maxExec = parseInt(maxExecutions);
          const amountPerExecution = maxExec > 0 ? totalAmountWei / BigInt(maxExec) : totalAmountWei;
          const contractRecipients = toContractRecipients(flatRecipients);

          if (!scheduleEnabled) {
            // Immediate execution uses the full total amount
            return {
              functionParams: [tokenAddress, totalAmountWei, contractRecipients],
            };
          }

          const intervalSeconds = parseInt(intervalMinutes) * 60;
          return {
            functionParams: [
              tokenAddress,
              amountPerExecution,
              contractRecipients,
              intervalSeconds,
              maxExec,
            ],
          };
        }}
      >
        {({ onClick, isLoading }) => (
          <button
            onClick={async () => {
              if (!isValidConfiguration()) {
                alert(
                  "Please ensure all addresses are valid, total share is 100%, and interval/executions are valid"
                );
                return;
              }
              await onClick();
            }}
            disabled={isLoading || !isValidConfiguration()}
            className="btn btn-primary"
          >
            {isLoading ? "Processing…" : scheduleEnabled ? "Create Recurring Schedule" : "Execute Now"}
          </button>
        )}
      </BridgeAndExecuteButton>
    </div>
  );
}
