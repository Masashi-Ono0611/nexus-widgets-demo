"use client";
import React, { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { WalletGroup, DeFiStrategy, PAYROLL_CONFIG_REGISTRY_ADDRESS } from "../types";

interface ConfigManagerProps {
  walletGroups: WalletGroup[];
  intervalMinutes: string;
  maxExecutions: string;
  scheduleEnabled: boolean;
  onLoadConfig: (
    walletGroups: WalletGroup[],
    intervalMinutes: string,
    maxExecutions: string,
    scheduleEnabled: boolean
  ) => void;
}

interface SavedConfig {
  id: bigint;
  name: string;
  description: string;
  owner: string;
  isPublic: boolean;
  walletGroupCount: bigint;
}

const REGISTRY_ABI = [
  {
    name: "saveConfig",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      {
        name: "walletGroups",
        type: "tuple[]",
        components: [
          { name: "wallet", type: "address" },
          { name: "walletAmount", type: "uint256" },
          {
            name: "strategies",
            type: "tuple[]",
            components: [
              { name: "strategy", type: "uint8" },
              { name: "subPercent", type: "uint16" },
            ],
          },
        ],
      },
      {
        name: "schedule",
        type: "tuple",
        components: [
          { name: "enabled", type: "bool" },
          { name: "intervalMinutes", type: "uint256" },
          { name: "maxExecutions", type: "uint256" },
        ],
      },
      { name: "isPublic", type: "bool" },
    ],
    outputs: [{ name: "configId", type: "uint256" }],
  },
  {
    name: "getConfig",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "configId", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "walletGroupCount", type: "uint256" },
      {
        name: "schedule",
        type: "tuple",
        components: [
          { name: "enabled", type: "bool" },
          { name: "intervalMinutes", type: "uint256" },
          { name: "maxExecutions", type: "uint256" },
        ],
      },
      { name: "isPublic", type: "bool" },
      { name: "createdAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
    ],
  },
  {
    name: "getWalletGroup",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "configId", type: "uint256" },
      { name: "groupIndex", type: "uint256" },
    ],
    outputs: [
      { name: "wallet", type: "address" },
      { name: "walletAmount", type: "uint256" },
      { name: "strategyCount", type: "uint256" },
    ],
  },
  {
    name: "getStrategyAllocation",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "configId", type: "uint256" },
      { name: "groupIndex", type: "uint256" },
      { name: "strategyIndex", type: "uint256" },
    ],
    outputs: [
      { name: "strategy", type: "uint8" },
      { name: "subPercent", type: "uint16" },
    ],
  },
  {
    name: "getUserConfigIds",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getPublicConfigIds",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "deleteConfig",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "configId", type: "uint256" }],
    outputs: [],
  },
] as const;

export function ConfigManager({
  walletGroups,
  intervalMinutes,
  maxExecutions,
  scheduleEnabled,
  onLoadConfig,
}: ConfigManagerProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [configName, setConfigName] = useState("");
  const [configDescription, setConfigDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [userConfigs, setUserConfigs] = useState<SavedConfig[]>([]);
  const [publicConfigs, setPublicConfigs] = useState<SavedConfig[]>([]);
  const [showPublicConfigs, setShowPublicConfigs] = useState(false);

  const isRegistryConfigured = PAYROLL_CONFIG_REGISTRY_ADDRESS && PAYROLL_CONFIG_REGISTRY_ADDRESS !== "";

  useEffect(() => {
    if (showLoadModal && isRegistryConfigured) {
      loadConfigList();
    }
  }, [showLoadModal, showPublicConfigs]);

  const loadConfigList = async () => {
    if (!publicClient || !address) return;

    setIsLoading(true);
    try {
      const configIds = showPublicConfigs
        ? await publicClient.readContract({
            address: PAYROLL_CONFIG_REGISTRY_ADDRESS as `0x${string}`,
            abi: REGISTRY_ABI,
            functionName: "getPublicConfigIds",
          })
        : await publicClient.readContract({
            address: PAYROLL_CONFIG_REGISTRY_ADDRESS as `0x${string}`,
            abi: REGISTRY_ABI,
            functionName: "getUserConfigIds",
            args: [address],
          });

      const configs: SavedConfig[] = [];
      for (const id of configIds as bigint[]) {
        const config = await publicClient.readContract({
          address: PAYROLL_CONFIG_REGISTRY_ADDRESS as `0x${string}`,
          abi: REGISTRY_ABI,
          functionName: "getConfig",
          args: [id],
        });

        configs.push({
          id: config[0],
          owner: config[1],
          name: config[2],
          description: config[3],
          walletGroupCount: config[4],
          isPublic: config[6],
        });
      }

      if (showPublicConfigs) {
        setPublicConfigs(configs);
      } else {
        setUserConfigs(configs);
      }
    } catch (error) {
      console.error("Failed to load configs:", error);
      alert("Failed to load configurations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!walletClient || !address || !publicClient) {
      alert("Please connect your wallet");
      return;
    }

    if (!configName.trim()) {
      alert("Please enter a configuration name");
      return;
    }

    setIsSaving(true);
    try {
      // Convert wallet groups to contract format
      const contractWalletGroups = walletGroups.map((group) => ({
        wallet: group.wallet as `0x${string}`,
        walletAmount: parseUnits(group.walletAmount || "0", 6), // USDC has 6 decimals
        strategies: group.strategies.map((s) => ({
          strategy: s.strategy,
          subPercent: Math.round(parseFloat(s.subPercent) * 100), // Convert to basis points
        })),
      }));

      const schedule = {
        enabled: scheduleEnabled,
        intervalMinutes: BigInt(intervalMinutes || "0"),
        maxExecutions: BigInt(maxExecutions || "0"),
      };

      // Simulate to check for errors
      await publicClient.simulateContract({
        address: PAYROLL_CONFIG_REGISTRY_ADDRESS as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: "saveConfig",
        args: [configName, configDescription, contractWalletGroups, schedule, isPublic],
        account: address,
      });

      // Execute transaction
      const hash = await walletClient.writeContract({
        address: PAYROLL_CONFIG_REGISTRY_ADDRESS as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: "saveConfig",
        args: [configName, configDescription, contractWalletGroups, schedule, isPublic],
      });

      console.log("Transaction hash:", hash);
      alert("Configuration saved successfully! Tx: " + hash);

      setShowSaveModal(false);
      setConfigName("");
      setConfigDescription("");
      setIsPublic(false);
    } catch (error: any) {
      console.error("Failed to save config:", error);
      alert("Failed to save configuration: " + (error.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (configId: bigint) => {
    if (!publicClient) return;

    setIsLoading(true);
    try {
      // Get config metadata
      const config = await publicClient.readContract({
        address: PAYROLL_CONFIG_REGISTRY_ADDRESS as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: "getConfig",
        args: [configId],
      });

      const walletGroupCount = Number(config[4]);
      const schedule = config[5];

      // Load wallet groups
      const loadedWalletGroups: WalletGroup[] = [];
      for (let i = 0; i < walletGroupCount; i++) {
        const group = await publicClient.readContract({
          address: PAYROLL_CONFIG_REGISTRY_ADDRESS as `0x${string}`,
          abi: REGISTRY_ABI,
          functionName: "getWalletGroup",
          args: [configId, BigInt(i)],
        });

        const strategyCount = Number(group[2]);
        const strategies = [];

        for (let j = 0; j < strategyCount; j++) {
          const strategy = await publicClient.readContract({
            address: PAYROLL_CONFIG_REGISTRY_ADDRESS as `0x${string}`,
            abi: REGISTRY_ABI,
            functionName: "getStrategyAllocation",
            args: [configId, BigInt(i), BigInt(j)],
          });

          strategies.push({
            strategy: strategy[0] as DeFiStrategy,
            subPercent: String(Number(strategy[1]) / 100), // Convert from basis points
          });
        }

        loadedWalletGroups.push({
          wallet: group[0],
          walletAmount: formatUnits(group[1], 6), // USDC has 6 decimals
          strategies,
        });
      }

      // Load into form
      onLoadConfig(
        loadedWalletGroups,
        String(schedule.intervalMinutes),
        String(schedule.maxExecutions),
        schedule.enabled
      );

      setShowLoadModal(false);
      alert("Configuration loaded successfully!");
    } catch (error) {
      console.error("Failed to load config:", error);
      alert("Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (configId: bigint) => {
    if (!walletClient || !address) {
      alert("Please connect your wallet");
      return;
    }

    if (!confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    try {
      const hash = await walletClient.writeContract({
        address: PAYROLL_CONFIG_REGISTRY_ADDRESS as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: "deleteConfig",
        args: [configId],
      });

      console.log("Delete transaction hash:", hash);
      alert("Configuration deleted successfully!");
      loadConfigList();
    } catch (error: any) {
      console.error("Failed to delete config:", error);
      alert("Failed to delete configuration: " + (error.message || error));
    }
  };

  if (!isRegistryConfigured) {
    return (
      <div style={{ marginBottom: "1rem", padding: "1rem", background: "#FFF3CD", borderRadius: "8px" }}>
        <p style={{ margin: 0, color: "#856404" }}>
          ⚠️ PayrollConfigRegistry not deployed yet. Deploy the contract first.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => setShowSaveModal(true)} className="btn" style={{ flex: 1, background: "#4CAF50" }}>
          💾 Save Configuration
        </button>
        <button onClick={() => setShowLoadModal(true)} className="btn" style={{ flex: 1, background: "#2196F3" }}>
          📂 Load Configuration
        </button>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowSaveModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Save Configuration</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Name *</label>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="e.g., Monthly Payroll"
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Description</label>
              <textarea
                value={configDescription}
                onChange={(e) => setConfigDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                <span>Make this configuration public (others can view and copy)</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setShowSaveModal(false)} className="btn" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowLoadModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Load Configuration</h3>

            <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setShowPublicConfigs(false)}
                className="btn"
                style={{
                  flex: 1,
                  background: !showPublicConfigs ? "#2196F3" : "#e0e0e0",
                  color: !showPublicConfigs ? "white" : "black",
                }}
              >
                My Configs
              </button>
              <button
                onClick={() => setShowPublicConfigs(true)}
                className="btn"
                style={{
                  flex: 1,
                  background: showPublicConfigs ? "#2196F3" : "#e0e0e0",
                  color: showPublicConfigs ? "white" : "black",
                }}
              >
                Public Configs
              </button>
            </div>

            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div>
                {(showPublicConfigs ? publicConfigs : userConfigs).length === 0 ? (
                  <p style={{ textAlign: "center", color: "#666" }}>
                    No configurations found
                  </p>
                ) : (
                  (showPublicConfigs ? publicConfigs : userConfigs).map((config) => (
                    <div
                      key={config.id.toString()}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "1rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 0.5rem 0" }}>
                            {config.name}
                            {config.isPublic && (
                              <span style={{ marginLeft: "0.5rem", fontSize: "0.8em", color: "#666" }}>🌐 Public</span>
                            )}
                          </h4>
                          {config.description && (
                            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9em", color: "#666" }}>
                              {config.description}
                            </p>
                          )}
                          <p style={{ margin: 0, fontSize: "0.85em", color: "#999" }}>
                            {Number(config.walletGroupCount)} wallet group(s) • Owner: {config.owner.slice(0, 6)}...
                            {config.owner.slice(-4)}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
                          <button
                            onClick={() => handleLoad(config.id)}
                            className="btn"
                            style={{ background: "#4CAF50", padding: "0.5rem 1rem" }}
                          >
                            Load
                          </button>
                          {!showPublicConfigs && address?.toLowerCase() === config.owner.toLowerCase() && (
                            <button
                              onClick={() => handleDelete(config.id)}
                              className="btn"
                              style={{ background: "#f44336", padding: "0.5rem 1rem" }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <button
              onClick={() => setShowLoadModal(false)}
              className="btn"
              style={{ width: "100%", marginTop: "1rem" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
