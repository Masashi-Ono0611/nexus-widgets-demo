"use client";
import React, { useState, useEffect } from "react";
import { ConfigManagerProps } from "./configManager/types";
import { useWallet } from "./configManager/useWallet";
import { useConfigRegistry } from "./configManager/useConfigRegistry";
import { SaveConfigModal } from "./configManager/SaveConfigModal";
import { LoadConfigModal } from "./configManager/LoadConfigModal";
import { useToast } from "../../common/ToastProvider";
import { isValidAddress, totalShare } from "../utils";

function ConfigManagerComponent({ recipients, onLoadConfig }: ConfigManagerProps) {
  const { mounted, address, provider, signer } = useWallet();
  const { showInfo, showSuccess } = useToast();

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
      const href = `${base}/gifting/${newId.toString()}/receive/qr`;
      showSuccess(
        <div style={{ padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.125rem' }}>✅</span>
            <span style={{ fontWeight: '600' }}>Configuration Saved!</span>
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
            Share this QR code link with recipients:
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            background: '#f3f4f6',
            padding: '0.5rem',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            wordBreak: 'break-all'
          }}>
            {href}
          </div>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              background: '#3B82F6',
              color: '#fff',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              textDecoration: 'none',
              transition: 'background 0.2s'
            }}
          >
            📱 Open QR Code
          </a>
        </div>,
        10000 // 10 seconds
      );
    }
  };

  const handleUpdateSave = async () => {
    if (loadedConfigId === null) {
      showInfo("No configuration loaded to update");
      return;
    }

    const success = await updateConfig(loadedConfigId, configName, configDescription, recipients);

    if (success) {
      setShowUpdateSaveModal(false);
      setConfigName("");
      setConfigDescription("");
      setIsPublic(false);

      const base = typeof window !== "undefined" ? window.location.origin : "";
      const href = `${base}/gifting/${loadedConfigId.toString()}/receive/qr`;
      showSuccess(
        <div style={{ padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.125rem' }}>🔄</span>
            <span style={{ fontWeight: '600' }}>Configuration Updated!</span>
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
            Updated configuration. Share this QR code link with recipients:
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            background: '#f3f4f6',
            padding: '0.5rem',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            wordBreak: 'break-all'
          }}>
            {href}
          </div>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              background: '#3B82F6',
              color: '#fff',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              textDecoration: 'none',
              transition: 'background 0.2s'
            }}
          >
            📱 Open QR Code
          </a>
        </div>,
        10000 // 10 seconds
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
      showSuccess("Configuration loaded. You can now use Update Save.");
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
          disabled={!canOpenNewSave}
          style={{
            flex: 1,
            background: "#4CAF50",
            opacity: canOpenNewSave ? 1 : 0.6,
            cursor: canOpenNewSave ? "pointer" : "not-allowed",
          }}
        >
          💾 New Save
        </button>
        <button
          onClick={() => setShowUpdateSaveModal(true)}
          className="btn"
          style={{
            flex: 1,
            background: canOpenUpdateSave ? "#FF9800" : "#ccc",
            cursor: canOpenUpdateSave ? "pointer" : "not-allowed",
          }}
          disabled={!canOpenUpdateSave}
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
