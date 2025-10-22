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

  return (
    <div className="card">
      <h3>Recurring Token Splitter (Arbitrum Sepolia) 🔄</h3>
      <p className="text-sm" style={{ marginBottom: "1rem" }}>
        Create recurring token distributions with Gelato automation
      </p>

      {/* Totals Summary */}
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
        <div><strong>Total Amount:</strong> {totalAmountComputed ? totalAmountComputed.toFixed(6) : "0"} USDC</div>
        <div><strong>Overall Share:</strong> {totalShareValue.toFixed(2)}%</div>
      </div>

      {/* Schedule Configuration */}
      <div style={{ marginBottom: "1rem" }}>
        <label className="field" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={scheduleEnabled}
            onChange={(e) => setScheduleEnabled(e.target.checked)}
          />
          <span>Enable Recurring Schedule</span>
        </label>

        {scheduleEnabled && (
          <>
            <label className="field">
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

            <label className="field">
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
          </>
        )}
      </div>

      {/* Recipients Configuration (Wallet -> Strategies) */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <strong>Wallet Allocations ({walletGroups.length}/5)</strong>
          <span style={{ color: Math.abs(totalWalletPercent - 100) < 0.01 ? "green" : "red", fontSize: "0.9rem" }}>
            Wallets Total: {totalWalletPercent.toFixed(2)}% {Math.abs(totalWalletPercent - 100) < 0.01 ? "✓" : "(must be 100%)"}
          </span>
        </div>
        <div style={{ fontSize: "0.85rem", marginBottom: "0.5rem", color: flatRecipients.length <= 20 ? "#2e7d32" : "#c62828" }}>
          Recipients Total: {flatRecipients.length}/20
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
                <span style={{ color: Math.abs(strategiesSum - 100) < 0.01 ? "green" : "red", fontSize: "0.9rem" }}>
                  Strategies Total: {strategiesSum.toFixed(2)}% {Math.abs(strategiesSum - 100) < 0.01 ? "✓" : "(must be 100%)"}
                </span>
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
                        <div className="input" style={{ display: "flex", alignItems: "center", height: "36px" }}>{STRATEGY_LABELS[s.strategy]}</div>
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

      {/* Info Section */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          background: "#f5f5f5",
          borderRadius: "4px",
          fontSize: "0.85rem",
          color: "#333",
        }}
      >
        <strong>How it works:</strong>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>
            <strong>Recurring Distribution:</strong> Automatically distributes tokens at set intervals
          </li>
          <li>
            <strong>Gelato Automation:</strong> No manual execution needed after setup
          </li>
          <li>
            <strong>Flexible Strategies:</strong> Each recipient can have different DeFi strategies
          </li>
          <li>
            <strong>Max Executions:</strong> Set limit or run unlimited (0)
          </li>
        </ul>
        <div style={{ marginTop: "0.5rem", color: "#0066cc", background: "#e6f2ff", padding: "0.5rem", borderRadius: "4px" }}>
          💡 <strong>Amount Calculation:</strong> The total amount you enter will be divided by max executions.
          <br />
          Example: 3 USDC with 3 executions = 1 USDC per execution
        </div>
        <div style={{ marginTop: "0.5rem", color: "#ff6600" }}>
          ⚠️ <strong>Important:</strong> The widget will automatically approve the total amount (amount per execution × max executions)
        </div>
      </div>
    </div>
  );
}
