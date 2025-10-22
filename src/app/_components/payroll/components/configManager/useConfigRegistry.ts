import { useState } from "react";
import { ethers } from "ethers";
import { WalletGroup, DeFiStrategy, PAYROLL_CONFIG_REGISTRY_ADDRESS } from "../../types";
import { SavedConfig } from "./types";
import { REGISTRY_ABI } from "./abi";

export function useConfigRegistry(
  provider: ethers.BrowserProvider | null,
  signer: ethers.JsonRpcSigner | null,
  address: string | null
) {
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadConfigList = async () => {
    if (!provider || !PAYROLL_CONFIG_REGISTRY_ADDRESS) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        provider
      );

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

  const saveConfig = async (
    configName: string,
    configDescription: string,
    walletGroups: WalletGroup[],
    scheduleEnabled: boolean,
    intervalMinutes: string,
    maxExecutions: string,
    isPublic: boolean
  ) => {
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
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

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
      return true;
    } catch (error: any) {
      console.error("Failed to save config:", error);
      alert("Failed to save configuration: " + (error.message || error));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = async (
    configId: bigint,
    configName: string,
    configDescription: string,
    walletGroups: WalletGroup[],
    scheduleEnabled: boolean,
    intervalMinutes: string,
    maxExecutions: string,
    isPublic: boolean
  ) => {
    if (!signer || !address || !provider) {
      alert("Please connect your wallet");
      return;
    }

    if (!configName.trim()) {
      alert("Please enter a configuration name");
      return;
    }

    setIsSaving(true);
    try {
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
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      const tx = await contract.updateConfig(
        configId,
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
      return true;
    } catch (error: any) {
      console.error("Failed to update config:", error);
      alert("Failed to update configuration: " + (error.message || error));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadConfig = async (configId: bigint) => {
    if (!provider || !PAYROLL_CONFIG_REGISTRY_ADDRESS) return null;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        provider
      );

      const config = await contract.getConfig(configId);

      const walletGroupCount = Number(config[4]);
      const schedule = config[5];

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
            subPercent: String(Number(strategy[1]) / 100),
          });
        }

        loadedWalletGroups.push({
          wallet: group[0],
          walletAmount: ethers.formatUnits(group[1], 6),
          strategies,
        });
      }

      return {
        walletGroups: loadedWalletGroups,
        intervalMinutes: String(schedule.intervalMinutes),
        maxExecutions: String(schedule.maxExecutions),
        scheduleEnabled: schedule.enabled,
        name: config[2],
        description: config[3],
        isPublic: config[6],
      };
    } catch (error) {
      console.error("Failed to load config:", error);
      alert("Failed to load configuration");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConfig = async (configId: bigint) => {
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
