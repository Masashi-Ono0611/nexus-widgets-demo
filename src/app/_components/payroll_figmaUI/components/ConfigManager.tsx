"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Button } from '../../ui/button';
import { ConfigManagerProps } from "./configManager/types";
import { useWallet } from "./configManager/useWallet";
import { useConfigRegistry } from "./configManager/useConfigRegistry";
import { SaveConfigModal } from "./configManager/SaveConfigModal";
import { LoadConfigModal } from "./configManager/LoadConfigModal";
import { toast } from 'sonner';
import { isValidAddress, sumPercent, buildFlatRecipientsFromGroups, totalShare } from "../utils";

function ConfigManagerComponent({
  walletGroups,
  intervalMinutes,
  maxExecutions,
  scheduleEnabled,
  onLoadConfig,
}: ConfigManagerProps) {
  const { mounted, address, provider, signer, networkError, needsNetworkSwitch, promptSwitchNetwork } = useWallet();

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
      if (networkError) {
        toast.info(networkError);
      } else {
        loadConfigList();
      }
    }
  }, [showLoadModal, networkError]);

  useEffect(() => {
    if (!networkError && showLoadModal) {
      loadConfigList();
    }
  }, [networkError]);

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
      toast.info("No configuration loaded to update");
      return;
    }

    const success = await updateConfig(
      loadedConfigId,
      configName,
      configDescription,
      walletGroups,
      scheduleEnabled,
      intervalMinutes,
      maxExecutions
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
      toast.success("Configuration loaded successfully.");
    }
  };

  const hasLoadedConfig = loadedConfigId !== null;

  const totalAmountComputed = useMemo(
    () => walletGroups.reduce((s, g) => s + (parseFloat(g.walletAmount) || 0), 0),
    [walletGroups]
  );
  const totalWalletPercent = useMemo(() => {
    return totalAmountComputed > 0
      ? walletGroups.reduce((s, g) => s + ((parseFloat(g.walletAmount) || 0) / totalAmountComputed) * 100, 0)
      : 0;
  }, [walletGroups, totalAmountComputed]);
  const flatRecipients = useMemo(
    () => buildFlatRecipientsFromGroups(walletGroups, totalAmountComputed),
    [walletGroups, totalAmountComputed]
  );
  const totalShareValue = useMemo(() => totalShare(flatRecipients), [flatRecipients]);

  const configRecipientsValid = useMemo(() => {
    const recipientsOk = walletGroups.every((g) => isValidAddress(g.wallet));
    const shareOk = Math.abs(totalShareValue - 100) < 0.01;
    const walletsTotalOk = Math.abs(totalWalletPercent - 100) < 0.01;
    const eachWalletOk = walletGroups.every(
      (g) => Math.abs(sumPercent(g.strategies.map((s) => s.subPercent)) - 100) < 0.01
    );
    const recipientCountOk = flatRecipients.length <= 20;
    return recipientsOk && shareOk && walletsTotalOk && eachWalletOk && recipientCountOk;
  }, [walletGroups, totalShareValue, totalWalletPercent, flatRecipients]);

  const scheduleValid = useMemo(() => {
    if (!scheduleEnabled) return true;
    const interval = parseInt(intervalMinutes);
    const maxExec = parseInt(maxExecutions);
    const validInterval = interval >= 1 && interval <= 525600;
    const validMaxExecutions = maxExec >= 0 && maxExec <= 1000;
    return validInterval && validMaxExecutions;
  }, [scheduleEnabled, intervalMinutes, maxExecutions]);

  const canOpenNewSave = configRecipientsValid && scheduleValid;
  const canOpenUpdateSave = hasLoadedConfig && configRecipientsValid && scheduleValid;

  if (!mounted) {
    return null;
  }

  const guardNetworkThen = async (fn: () => void) => {
    if (needsNetworkSwitch) {
      toast.info("Switching to Arbitrum Sepolia...");
      await promptSwitchNetwork();
      // After network switch, reload the page to ensure clean provider state
      toast.info("Reloading page to complete network switch...");
      setTimeout(() => {
        window.location.reload();
      }, 500);
      return;
    }
    fn();
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => guardNetworkThen(() => setShowLoadModal(true))}
        variant="outline"
        size="sm"
      >
        📂 Load
      </Button>
      <Button
        onClick={() => guardNetworkThen(() => setShowNewSaveModal(true))}
        disabled={!canOpenNewSave}
        variant="outline"
        size="sm"
        title={canOpenNewSave ? "Save a new configuration" : "Fix wallets/percentages or schedule first"}
      >
        💾 New Save
      </Button>
      <Button
        onClick={() => guardNetworkThen(() => setShowUpdateSaveModal(true))}
        disabled={!canOpenUpdateSave}
        variant="outline"
        size="sm"
        title={
          canOpenUpdateSave
            ? "Update the loaded configuration"
            : hasLoadedConfig
              ? "Fix wallets/percentages or schedule first"
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
