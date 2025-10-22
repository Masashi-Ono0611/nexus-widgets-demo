"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { WalletGroup, DeFiStrategy } from "../types";

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
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const [showSaveNewModal, setShowSaveNewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [configName, setConfigName] = useState("");
  const [configDescription, setConfigDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [newRegistryAddress, setNewRegistryAddress] = useState("");
  const [updateRegistryAddress, setUpdateRegistryAddress] = useState("");
  const [updateConfigId, setUpdateConfigId] = useState<bigint | null>(null);
  const [loadRegistryAddress, setLoadRegistryAddress] = useState("");

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
    if (showLoadModal && loadRegistryAddress && ethers.isAddress(loadRegistryAddress)) {
      loadConfigList();
    }
  }, [showLoadModal, loadRegistryAddress]);

  const loadConfigList = async () => {
    if (!provider || !loadRegistryAddress) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        loadRegistryAddress,
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

  const handleSaveNew = async () => {
    if (!signer || !address || !provider) {
      alert("Please connect your wallet");
      return;
    }

    if (!newRegistryAddress.trim()) {
      alert("Please enter a registry contract address");
      return;
    }

    if (!ethers.isAddress(newRegistryAddress)) {
      alert("Invalid contract address");
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
        newRegistryAddress,
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

      setShowSaveNewModal(false);
      setConfigName("");
      setConfigDescription("");
      setIsPublic(false);
      setNewRegistryAddress("");
    } catch (error: any) {
      console.error("Failed to save config:", error);
      alert("Failed to save configuration: " + (error.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!signer || !address || !provider) {
      alert("Please connect your wallet");
      return;
    }

    if (!updateRegistryAddress.trim() || !updateConfigId) {
      alert("Invalid update parameters");
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
        walletAmount: ethers.parseUnits(group.walletAmount || "0", 6),
        strategies: group.strategies.map((s) => ({
          strategy: s.strategy,
          subPercent: Math.round(parseFloat(s.subPercent) * 100),
        })),
      }));

      const schedule = {
        enabled: scheduleEnabled,
        intervalMinutes: BigInt(intervalMinutes || "0"),
        maxExecutions: BigInt(maxExecutions || "0"),
      };

      const contract = new ethers.Contract(
        updateRegistryAddress,
        REGISTRY_ABI,
        signer
      );

      // Execute update transaction
      const tx = await contract.updateConfig(
        updateConfigId,
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

      setShowUpdateModal(false);
      setConfigName("");
      setConfigDescription("");
      setIsPublic(false);
      setUpdateRegistryAddress("");
      setUpdateConfigId(null);
    } catch (error: any) {
      console.error("Failed to update config:", error);
      alert("Failed to update configuration: " + (error.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (configId: bigint) => {
    if (!provider || !loadRegistryAddress) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        loadRegistryAddress,
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
    if (!signer || !address || !loadRegistryAddress) {
      alert("Please connect your wallet");
      return;
    }

    if (!confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    try {
      const contract = new ethers.Contract(
        loadRegistryAddress,
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

  const handlePrepareUpdate = async (config: SavedConfig) => {
    setUpdateRegistryAddress(loadRegistryAddress);
    setUpdateConfigId(config.id);
    setConfigName(config.name);
    setConfigDescription(config.description);
    setIsPublic(config.isPublic);
    
    // Load the full config data to populate the form
    try {
      const contract = new ethers.Contract(
        loadRegistryAddress,
        REGISTRY_ABI,
        provider!
      );
      
      const fullConfig = await contract.getConfig(config.id);
      const schedule = fullConfig[5];
      
      // Load wallet groups
      const walletGroupCount = Number(config.walletGroupCount);
      const loadedWalletGroups: WalletGroup[] = [];
      
      for (let i = 0; i < walletGroupCount; i++) {
        const group = await contract.getWalletGroup(config.id, BigInt(i));
        const strategyCount = Number(group[2]);
        const strategies = [];
        
        for (let j = 0; j < strategyCount; j++) {
          const strategy = await contract.getStrategyAllocation(
            config.id,
            BigInt(i),
            BigInt(j)
          );
          
          strategies.push({
            strategy: strategy[0] as DeFiStrategy,
            subPercent: String(Number(strategy[1]) / 100),
          });
        }
        
        loadedWalletGroups.push({
          wallet: group[0],
          walletAmount: ethers.formatUnits(group[1], 6),
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
      
      setShowUpdateModal(true);
      setShowLoadModal(false);
    } catch (error) {
      console.error("Failed to load config for update:", error);
      alert("Failed to load configuration data");
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => setShowSaveNewModal(true)} className="btn" style={{ flex: 1, background: "#4CAF50" }}>
          💾 Save New Config
        </button>
        <button onClick={() => setShowLoadModal(true)} className="btn" style={{ flex: 1, background: "#2196F3" }}>
          📂 Load Configuration
        </button>
      </div>

      {/* Save New Modal */}
      {showSaveNewModal && (
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
          onClick={() => setShowSaveNewModal(false)}
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
            <h3 style={{ marginTop: 0 }}>Save New Configuration</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Registry Contract Address *
              </label>
              <input
                type="text"
                value={newRegistryAddress}
                onChange={(e) => setNewRegistryAddress(e.target.value)}
                placeholder="0x..."
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <small style={{ color: "#666", fontSize: "0.85em" }}>
                Enter the PayrollConfigRegistry contract address (new or existing)
              </small>
            </div>
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
                onClick={handleSaveNew}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {isSaving ? "Saving..." : "Save New"}
              </button>
              <button onClick={() => setShowSaveNewModal(false)} className="btn" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
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
          onClick={() => setShowUpdateModal(false)}
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
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Registry Contract Address
              </label>
              <input
                type="text"
                value={updateRegistryAddress}
                disabled
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", background: "#f5f5f5" }}
              />
              <small style={{ color: "#666", fontSize: "0.85em" }}>
                Config ID: {updateConfigId?.toString()}
              </small>
            </div>
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
                onClick={handleUpdate}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {isSaving ? "Updating..." : "Update"}
              </button>
              <button onClick={() => setShowUpdateModal(false)} className="btn" style={{ flex: 1 }}>
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

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Registry Contract Address *
              </label>
              <input
                type="text"
                value={loadRegistryAddress}
                onChange={(e) => setLoadRegistryAddress(e.target.value)}
                placeholder="0x..."
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <small style={{ color: "#666", fontSize: "0.85em" }}>
                Enter any PayrollConfigRegistry contract address to load configurations
              </small>
            </div>

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
                        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem", flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleLoad(config.id)}
                            className="btn"
                            style={{ background: "#4CAF50", padding: "0.5rem 1rem" }}
                          >
                            Load
                          </button>
                          {address?.toLowerCase() === config.owner.toLowerCase() && (
                            <>
                              <button
                                onClick={() => handlePrepareUpdate(config)}
                                className="btn"
                                style={{ background: "#FF9800", padding: "0.5rem 1rem" }}
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleDelete(config.id)}
                                className="btn"
                                style={{ background: "#f44336", padding: "0.5rem 1rem" }}
                              >
                                Delete
                              </button>
                            </>
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
