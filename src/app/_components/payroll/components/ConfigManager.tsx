"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
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

function ConfigManagerComponent({
  walletGroups,
  intervalMinutes,
  maxExecutions,
  scheduleEnabled,
  onLoadConfig,
}: ConfigManagerProps) {
  
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const [showNewSaveModal, setShowNewSaveModal] = useState(false);
  const [showUpdateSaveModal, setShowUpdateSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [configName, setConfigName] = useState("");
  const [configDescription, setConfigDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  
  // Track loaded config for update
  const [loadedConfigId, setLoadedConfigId] = useState<bigint | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Initialize ethereum provider
    const initProvider = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
        setProvider(ethProvider);
        
        try {
          const accounts = await ethProvider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            const ethSigner = await ethProvider.getSigner();
            setSigner(ethSigner);
          }
        } catch (error) {
          console.error("Failed to get accounts:", error);
        }
      }
    };
    
    initProvider();
    
    // Listen for account changes
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          initProvider();
        } else {
          setAddress(null);
          setSigner(null);
        }
      };
      
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      
      return () => {
        (window as any).ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  useEffect(() => {
    if (showLoadModal && PAYROLL_CONFIG_REGISTRY_ADDRESS) {
      loadConfigList();
    }
  }, [showLoadModal]);

  const loadConfigList = async () => {
    if (!provider || !PAYROLL_CONFIG_REGISTRY_ADDRESS) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        provider
      );

      // Get all public configs from the contract
      const configIds = await contract.getPublicConfigIds();

      const loadedConfigs: SavedConfig[] = [];
      for (const id of configIds) {
        const config = await contract.getConfig(id);

        loadedConfigs.push({
          id: config[0],
          owner: config[1],
          name: config[2],
          description: config[3],
          walletGroupCount: config[4],
          isPublic: config[6],
        });
      }

      setConfigs(loadedConfigs);
    } catch (error) {
      console.error("Failed to load configs:", error);
      alert("Failed to load configurations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSave = async () => {
    if (!signer || !address || !provider) {
      alert("Please connect your wallet");
      return;
    }

    if (!PAYROLL_CONFIG_REGISTRY_ADDRESS) {
      alert("Registry contract not configured");
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
        wallet: group.wallet,
        walletAmount: ethers.parseUnits(group.walletAmount || "0", 6), // USDC has 6 decimals
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

      const contract = new ethers.Contract(
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      // Execute transaction
      const tx = await contract.saveConfig(
        configName,
        configDescription,
        contractWalletGroups,
        schedule,
        isPublic
      );
      const receipt = await tx.wait();
      const hash = receipt.hash;

      console.log("Transaction hash:", hash);
      alert("Configuration saved successfully! Tx: " + hash);

      setShowNewSaveModal(false);
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

  const handleUpdateSave = async () => {
    if (!signer || !address || !provider) {
      alert("Please connect your wallet");
      return;
    }

    if (!loadedConfigId) {
      alert("No configuration loaded to update");
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
        wallet: group.wallet,
        walletAmount: ethers.parseUnits(group.walletAmount || "0", 6), // USDC has 6 decimals
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

      const contract = new ethers.Contract(
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      // Execute transaction
      const tx = await contract.updateConfig(
        loadedConfigId,
        configName,
        configDescription,
        contractWalletGroups,
        schedule,
        isPublic
      );
      const receipt = await tx.wait();
      const hash = receipt.hash;

      console.log("Transaction hash:", hash);
      alert("Configuration updated successfully! Tx: " + hash);

      setShowUpdateSaveModal(false);
      setConfigName("");
      setConfigDescription("");
      setIsPublic(false);
    } catch (error: any) {
      console.error("Failed to update config:", error);
      alert("Failed to update configuration: " + (error.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (configId: bigint) => {
    if (!provider || !PAYROLL_CONFIG_REGISTRY_ADDRESS) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        provider
      );

      // Get config metadata
      const config = await contract.getConfig(configId);

      const walletGroupCount = Number(config[4]);
      const schedule = config[5];

      // Load wallet groups
      const loadedWalletGroups: WalletGroup[] = [];
      for (let i = 0; i < walletGroupCount; i++) {
        const group = await contract.getWalletGroup(configId, BigInt(i));

        const strategyCount = Number(group[2]);
        const strategies = [];

        for (let j = 0; j < strategyCount; j++) {
          const strategy = await contract.getStrategyAllocation(
            configId,
            BigInt(i),
            BigInt(j)
          );

          strategies.push({
            strategy: strategy[0] as DeFiStrategy,
            subPercent: String(Number(strategy[1]) / 100), // Convert from basis points
          });
        }

        loadedWalletGroups.push({
          wallet: group[0],
          walletAmount: ethers.formatUnits(group[1], 6), // USDC has 6 decimals
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

      // Store loaded config info for update
      setLoadedConfigId(configId);
      setConfigName(config[2]); // name
      setConfigDescription(config[3]); // description
      setIsPublic(config[6]); // isPublic

      setShowLoadModal(false);
      alert("Configuration loaded successfully! You can now use 'Update Save' button.");
    } catch (error) {
      console.error("Failed to load config:", error);
      alert("Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (configId: bigint) => {
    if (!signer || !address || !PAYROLL_CONFIG_REGISTRY_ADDRESS) {
      alert("Please connect your wallet");
      return;
    }

    if (!confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    try {
      const contract = new ethers.Contract(
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      const tx = await contract.deleteConfig(configId);
      const receipt = await tx.wait();
      const hash = receipt.hash;

      console.log("Delete transaction hash:", hash);
      alert("Configuration deleted successfully!");
      loadConfigList();
    } catch (error: any) {
      console.error("Failed to delete config:", error);
      alert("Failed to delete configuration: " + (error.message || error));
    }
  };

  if (!mounted) {
    return null;
  }

  const hasLoadedConfig = loadedConfigId !== null;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => setShowLoadModal(true)} className="btn" style={{ flex: 1, background: "#2196F3" }}>
          📂 Load
        </button>
        <button onClick={() => setShowNewSaveModal(true)} className="btn" style={{ flex: 1, background: "#4CAF50" }}>
          💾 New Save
        </button>
        <button 
          onClick={() => {
            setShowUpdateSaveModal(true);
          }} 
          className="btn" 
          style={{ 
            flex: 1, 
            background: hasLoadedConfig ? "#FF9800" : "#ccc",
            cursor: hasLoadedConfig ? "pointer" : "not-allowed"
          }}
          disabled={!hasLoadedConfig}
          title={hasLoadedConfig ? "Update the loaded configuration" : "Load a configuration first to enable update"}
        >
          ✏️ Update Save {hasLoadedConfig ? `(ID: ${loadedConfigId!.toString()})` : "(Disabled)"}
        </button>
      </div>

      {/* New Save Modal */}
      {showNewSaveModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowNewSaveModal(false)}
        >
          <div
            style={{
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>New Save Configuration</h3>
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
                onClick={handleNewSave}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setShowNewSaveModal(false)} className="btn" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Save Modal */}
      {showUpdateSaveModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowUpdateSaveModal(false)}
        >
          <div
            style={{
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Update Configuration</h3>
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
                onClick={handleUpdateSave}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {isSaving ? "Updating..." : "Update"}
              </button>
              <button onClick={() => setShowUpdateSaveModal(false)} className="btn" style={{ flex: 1 }}>
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowLoadModal(false)}
        >
          <div
            style={{
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

            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div>
                {configs.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#666" }}>
                    No public configurations found
                  </p>
                ) : (
                  configs.map((config) => (
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
                          {address?.toLowerCase() === config.owner.toLowerCase() && (
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

// Wrap with React.memo to prevent unnecessary re-renders that would reset internal state
export const ConfigManager = React.memo(ConfigManagerComponent);
