"use client";
import React, { useState, useEffect } from "react";
import { ConfigManagerProps } from "./configManager/types";
import { useWallet } from "./configManager/useWallet";
import { useConfigRegistry } from "./configManager/useConfigRegistry";
import { SaveConfigModal } from "./configManager/SaveConfigModal";
import { LoadConfigModal } from "./configManager/LoadConfigModal";

function ConfigManagerComponent({
  walletGroups,
  intervalMinutes,
  maxExecutions,
  scheduleEnabled,
  onLoadConfig,
}: ConfigManagerProps) {
  const { mounted, address, provider, signer } = useWallet();

  const {
    configs,
    isLoading,
    isSaving,
    loadConfigList,
    saveConfig,
    updateConfig,
    loadConfig,
    deleteConfig,
  } = useConfigRegistry(provider, signer, address);

  const [showNewSaveModal, setShowNewSaveModal] = useState(false);
  const [showUpdateSaveModal, setShowUpdateSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [configName, setConfigName] = useState("");
  const [configDescription, setConfigDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loadedConfigId, setLoadedConfigId] = useState<bigint | null>(null);

  useEffect(() => {
    if (showLoadModal) {
      loadConfigList();
    }
  }, [showLoadModal]);

  const handleNewSave = async () => {
    const success = await saveConfig(
      configName,
      configDescription,
      walletGroups,
      scheduleEnabled,
      intervalMinutes,
      maxExecutions,
      isPublic
    );

    if (success) {
      setShowNewSaveModal(false);
      setConfigName("");
      setConfigDescription("");
      setIsPublic(false);
    }
  };

  const handleUpdateSave = async () => {
    if (loadedConfigId === null) {
      alert("No configuration loaded to update");
      return;
    }

    const success = await updateConfig(
      loadedConfigId,
      configName,
      configDescription,
      walletGroups,
      scheduleEnabled,
      intervalMinutes,
      maxExecutions,
      isPublic
    );

    if (success) {
      setShowUpdateSaveModal(false);
      setConfigName("");
      setConfigDescription("");
      setIsPublic(false);
    }
  };

  const handleLoad = async (configId: bigint) => {
    const config = await loadConfig(configId);

    if (config) {
      onLoadConfig(
        config.walletGroups,
        config.intervalMinutes,
        config.maxExecutions,
        config.scheduleEnabled
      );

      setLoadedConfigId(configId);
      setConfigName(config.name);
      setConfigDescription(config.description);
      setIsPublic(config.isPublic);

      setShowLoadModal(false);
      alert("Configuration loaded successfully! You can now use 'Update Save' button.");
    }
  };

  if (!mounted) {
    return null;
  }

  const hasLoadedConfig = loadedConfigId !== null;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => setShowLoadModal(true)}
          className="btn"
          style={{ flex: 1, background: "#2196F3" }}
        >
          📂 Load
        </button>
        <button
          onClick={() => setShowNewSaveModal(true)}
          className="btn"
          style={{ flex: 1, background: "#4CAF50" }}
        >
          💾 New Save
        </button>
        <button
          onClick={() => setShowUpdateSaveModal(true)}
          className="btn"
          style={{
            flex: 1,
            background: hasLoadedConfig ? "#FF9800" : "#ccc",
            cursor: hasLoadedConfig ? "pointer" : "not-allowed",
          }}
          disabled={!hasLoadedConfig}
          title={
            hasLoadedConfig
              ? "Update the loaded configuration"
              : "Load a configuration first to enable update"
          }
        >
          ✏️ Update Save {hasLoadedConfig ? `(ID: ${loadedConfigId!.toString()})` : "(Disabled)"}
        </button>
      </div>

      <SaveConfigModal
        isOpen={showNewSaveModal}
        onClose={() => setShowNewSaveModal(false)}
        onSave={handleNewSave}
        configName={configName}
        setConfigName={setConfigName}
        configDescription={configDescription}
        setConfigDescription={setConfigDescription}
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        isSaving={isSaving}
        title="New Save Configuration"
        saveButtonText="Save"
      />

      <SaveConfigModal
        isOpen={showUpdateSaveModal}
        onClose={() => setShowUpdateSaveModal(false)}
        onSave={handleUpdateSave}
        configName={configName}
        setConfigName={setConfigName}
        configDescription={configDescription}
        setConfigDescription={setConfigDescription}
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        isSaving={isSaving}
        title="Update Configuration"
        saveButtonText="Update"
      />

      <LoadConfigModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        configs={configs}
        isLoading={isLoading}
        onLoad={handleLoad}
        onDelete={deleteConfig}
        userAddress={address}
      />
    </div>
  );
}

export const ConfigManager = React.memo(ConfigManagerComponent);
