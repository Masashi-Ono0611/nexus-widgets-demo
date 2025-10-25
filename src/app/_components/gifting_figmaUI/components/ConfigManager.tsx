"use client";
import React, { useState, useEffect } from "react";
import { Button } from '../../ui/button';
import { ConfigManagerProps } from "./configManager/types";
import { useWallet } from "./configManager/useWallet";
import { useConfigRegistry } from "./configManager/useConfigRegistry";
import { SaveConfigModal } from "./configManager/SaveConfigModal";
import { LoadConfigModal } from "./configManager/LoadConfigModal";
import { toast } from 'sonner';
import { isValidAddress, totalShare } from "../utils";

function ConfigManagerComponent({ recipients, onLoadConfig }: ConfigManagerProps) {
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
    const newId = await saveConfig(configName, configDescription, recipients, isPublic);

    if (newId !== null) {
      setShowNewSaveModal(false);
      setConfigName("");
      setConfigDescription("");
      setIsPublic(false);

      const base = typeof window !== "undefined" ? window.location.origin : "";
      const href = `${base}/gifting_figmaUI/${newId.toString()}/receive/qr`;
      toast.success(
        <span>
          Configuration saved. Open QR: <a href={href} target="_blank" rel="noreferrer">{href}</a>
        </span>
      );
    }
  };

  const handleUpdateSave = async () => {
    if (loadedConfigId === null) {
      toast.info("No configuration loaded to update");
      return;
    }

    const success = await updateConfig(loadedConfigId, configName, configDescription, recipients);

    if (success) {
      setShowUpdateSaveModal(false);
      setConfigName("");
      setConfigDescription("");
      setIsPublic(false);

      const base = typeof window !== "undefined" ? window.location.origin : "";
      const href = `${base}/gifting_figmaUI/${loadedConfigId.toString()}/receive/qr`;
      toast.success(
        <span>
          Configuration updated. Open QR: <a href={href} target="_blank" rel="noreferrer">{href}</a>
        </span>
      );
    }
  };

  const handleLoad = async (configId: bigint) => {
    const config = await loadConfig(configId);

    if (config) {
      onLoadConfig(config.recipients);

      setLoadedConfigId(configId);
      setConfigName(config.name);
      setConfigDescription(config.description);
      setIsPublic(config.isPublic);

      setShowLoadModal(false);
      toast.success("Configuration loaded. You can now use Update Save.");
    }
  };

  const hasLoadedConfig = loadedConfigId !== null;

  const recipientsAreValid = React.useMemo(() => {
    if (!recipients || recipients.length === 0) return false;
    const total = totalShare(recipients);
    if (Math.abs(total - 100) >= 0.01) return false;
    if (recipients.length > 20) return false;
    for (const r of recipients) {
      if (!isValidAddress(r.wallet)) return false;
      const pct = parseFloat(r.sharePercent || "0");
      if (!(pct > 0)) return false;
    }
    return true;
  }, [recipients]);

  const canSaveNew = Boolean(configName.trim()) && recipientsAreValid;
  const canSaveUpdate = hasLoadedConfig && Boolean(configName.trim()) && recipientsAreValid;
  const canOpenNewSave = recipientsAreValid;
  const canOpenUpdateSave = hasLoadedConfig && recipientsAreValid;

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => setShowLoadModal(true)}
        variant="outline"
        size="sm"
      >
        📂 Load
      </Button>
      <Button
        onClick={() => setShowNewSaveModal(true)}
        disabled={!canOpenNewSave}
        variant="outline"
        size="sm"
        title={canOpenNewSave ? "Save a new configuration" : "Fix recipients/percentages first"}
      >
        💾 New Save
      </Button>
      <Button
        onClick={() => setShowUpdateSaveModal(true)}
        disabled={!canOpenUpdateSave}
        variant="outline"
        size="sm"
        title={
          canOpenUpdateSave
            ? "Update the loaded configuration"
            : hasLoadedConfig
              ? "Fix recipients/percentages first"
              : "Load a configuration first to enable update"
        }
      >
        ✏️ Update Save {hasLoadedConfig ? `(ID: ${loadedConfigId!.toString()})` : ""}
      </Button>

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
        showPublicToggle={false}
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
