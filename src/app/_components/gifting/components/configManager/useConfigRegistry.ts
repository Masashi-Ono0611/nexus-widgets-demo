import { useState } from "react";
import { ethers } from "ethers";
import { Recipient, DeFiStrategy, GIFTING_CONFIG_REGISTRY_ADDRESS } from "../../types";
import { SavedConfig } from "./types";
import { REGISTRY_ABI } from "./abi";
import { useToast } from "../../../common/ToastProvider";

export function useConfigRegistry(
  provider: ethers.BrowserProvider | null,
  signer: ethers.JsonRpcSigner | null,
  address: string | null
) {
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  const loadConfigList = async () => {
    if (!provider || !GIFTING_CONFIG_REGISTRY_ADDRESS) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        GIFTING_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        provider
      );

      const publicIds: bigint[] = await contract.getPublicConfigIds();
      let userIds: bigint[] = [];
      if (address) {
        try {
          userIds = await contract.getUserConfigIds(address);
        } catch (e) {
          console.error("Failed to load user config ids:", e);
        }
      }

      // Deduplicate
      const idSet = new Set<string>();
      const mergedIdStrings: string[] = [];
      for (const id of [...publicIds, ...userIds]) {
        const key = id.toString();
        if (!idSet.has(key)) {
          idSet.add(key);
          mergedIdStrings.push(key);
        }
      }

      const loadedConfigs: SavedConfig[] = [];
      for (const idStr of mergedIdStrings) {
        const id = BigInt(idStr);
        const config = await contract.getConfig(id);

        loadedConfigs.push({
          id: config[0],
          owner: config[1],
          name: config[2],
          description: config[3],
          recipientCount: config[4],
          isPublic: config[5],
        });
      }

      setConfigs(loadedConfigs);
    } catch (error) {
      console.error("Failed to load configs:", error);
      showError("Failed to load configurations");
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (
    configName: string,
    configDescription: string,
    recipients: Recipient[],
    isPublic: boolean
  ): Promise<bigint | null> => {
    if (!signer || !address || !provider) {
      showInfo("Please connect your wallet");
      return null;
    }

    if (!GIFTING_CONFIG_REGISTRY_ADDRESS) {
      showError("Registry contract not configured");
      return null;
    }

    if (!configName.trim()) {
      showInfo("Please enter a configuration name");
      return null;
    }

    setIsSaving(true);
    try {
      const contractRecipients = recipients.map((r) => ({
        wallet: r.wallet as `0x${string}`,
        sharePercent: Math.round(parseFloat(r.sharePercent || "0") * 100),
        strategy: r.strategy,
      }));

      const contract = new ethers.Contract(
        GIFTING_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      const tx = await contract.saveConfig(
        configName,
        configDescription,
        contractRecipients,
        isPublic
      );

      showInfo("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      try {
        const reader = new ethers.Contract(
          GIFTING_CONFIG_REGISTRY_ADDRESS,
          REGISTRY_ABI,
          provider
        );
        const ids: bigint[] = await reader.getUserConfigIds(address);
        const newId = ids.reduce((m, x) => (m === null || x > m ? x : m), null as bigint | null);
        // Don't show success message here - let ConfigManager handle it with QR code link
        return newId;
      } catch (e) {
        // Don't show success message here - let ConfigManager handle it with QR code link
        return null;
      }
    } catch (error: any) {
      console.error("Failed to save config:", error);
      showError(error?.message || "Failed to save configuration");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = async (
    configId: bigint,
    configName: string,
    configDescription: string,
    recipients: Recipient[]
  ) => {
    if (!signer || !address || !provider) {
      showInfo("Please connect your wallet");
      return false;
    }

    if (!GIFTING_CONFIG_REGISTRY_ADDRESS) {
      showError("Registry contract not configured");
      return false;
    }

    if (!configName.trim()) {
      showInfo("Please enter a configuration name");
      return false;
    }

    setIsSaving(true);
    try {
      const contractRecipients = recipients.map((r) => ({
        wallet: r.wallet as `0x${string}`,
        sharePercent: Math.round(parseFloat(r.sharePercent || "0") * 100),
        strategy: r.strategy,
      }));

      const contract = new ethers.Contract(
        GIFTING_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      const tx = await contract.updateConfig(
        configId,
        configName,
        configDescription,
        contractRecipients
      );

      showInfo("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      // Don't show success message here - let ConfigManager handle it with QR code link
      return true;
    } catch (error: any) {
      console.error("Failed to update config:", error);
      showError(error?.message || "Failed to update configuration");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadConfig = async (configId: bigint) => {
    if (!GIFTING_CONFIG_REGISTRY_ADDRESS) return null;

    try {
      // Use provided provider or create a read-only provider for Arbitrum Sepolia
      let readProvider: ethers.Provider = provider || new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");

      const contract = new ethers.Contract(
        GIFTING_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        readProvider
      );

      const config = await contract.getConfig(configId);
      const recipientCount = Number(config[4]);

      const recipients: Recipient[] = [];
      for (let i = 0; i < recipientCount; i++) {
        const recipient = await contract.getRecipient(configId, i);
        recipients.push({
          wallet: recipient[0],
          sharePercent: (Number(recipient[1]) / 100).toString(),
          strategy: Number(recipient[2]) as DeFiStrategy,
        });
      }

      return {
        id: config[0],
        owner: config[1],
        name: config[2],
        description: config[3],
        recipients,
        isPublic: config[5],
      };
    } catch (error) {
      console.error("Failed to load config:", error);
      showError("Failed to load configuration");
      return null;
    }
  };

  const deleteConfig = async (configId: bigint) => {
    if (!signer || !address) {
      showInfo("Please connect your wallet");
      return false;
    }

    if (!GIFTING_CONFIG_REGISTRY_ADDRESS) {
      showError("Registry contract not configured");
      return false;
    }

    try {
      const contract = new ethers.Contract(
        GIFTING_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      const tx = await contract.deleteConfig(configId);
      showInfo("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      showSuccess("Configuration deleted successfully!");
      await loadConfigList();
      return true;
    } catch (error: any) {
      console.error("Failed to delete config:", error);
      showError(error?.message || "Failed to delete configuration");
      return false;
    }
  };

  return {
    configs,
    isLoading,
    isSaving,
    loadConfigList,
    saveConfig,
    updateConfig,
    loadConfig,
    deleteConfig,
  };
}
