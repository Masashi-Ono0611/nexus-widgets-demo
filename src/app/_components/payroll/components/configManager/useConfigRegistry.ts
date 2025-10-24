import { useState } from "react";
import { ethers } from "ethers";
import { WalletGroup, DeFiStrategy, PAYROLL_CONFIG_REGISTRY_ADDRESS } from "../../types";
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
    if (!provider || !PAYROLL_CONFIG_REGISTRY_ADDRESS) {
      console.log("Provider or contract address not available");
      return;
    }

    // Check network
    const currentProvider = provider!; // Non-null assertion since we checked above
    try {
      const network = await currentProvider.getNetwork();
      if (network.chainId !== BigInt(421614)) {
        console.log(`Wrong network: ${network.name} (${network.chainId}), expected Arbitrum Sepolia (421614)`);
        showError("Please switch to Arbitrum Sepolia network");
        return;
      }
    } catch (error) {
      console.error("Failed to get network:", error);
      showError("Failed to detect network");
      return;
    }

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        currentProvider
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

      // Deduplicate by string key (ethers v6 BigInt-like values)
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
          walletGroupCount: config[4],
          isPublic: config[6],
        });
      }

      setConfigs(loadedConfigs);
    } catch (error) {
      console.error("Failed to load configs:", error);
      showError("Failed to load configurations. Please check your network connection and try again.");
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
      showInfo("Please connect your wallet");
      return;
    }

    if (!PAYROLL_CONFIG_REGISTRY_ADDRESS) {
      showError("Registry contract not configured");
      return;
    }

    // Check network
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(421614)) {
        showError("Please switch to Arbitrum Sepolia network");
        return;
      }
    } catch (error) {
      console.error("Failed to get network:", error);
      showError("Failed to detect network");
      return;
    }

    if (!configName.trim()) {
      showInfo("Please enter a configuration name");
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
      showSuccess("Configuration saved successfully");
      return true;
    } catch (error: any) {
      console.error("Failed to save config:", error);
      showError("Failed to save configuration: " + (error.message || error));
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
    maxExecutions: string
  ) => {
    if (!signer || !address || !provider) {
      showInfo("Please connect your wallet");
      return;
    }

    if (!configName.trim()) {
      showInfo("Please enter a configuration name");
      return;
    }

    // Check network
    const currentProvider = provider!; // Non-null assertion since we checked above
    try {
      const network = await currentProvider.getNetwork();
      if (network.chainId !== BigInt(421614)) {
        showError("Please switch to Arbitrum Sepolia network");
        return;
      }
    } catch (error) {
      console.error("Failed to get network:", error);
      showError("Failed to detect network");
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
        schedule
      );
      const receipt = await tx.wait();
      const hash = receipt.hash;

      console.log("Transaction hash:", hash);
      showSuccess("Configuration updated successfully");
      return true;
    } catch (error: any) {
      console.error("Failed to update config:", error);
      showError("Failed to update configuration: " + (error.message || error));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadConfig = async (configId: bigint) => {
    if (!provider || !PAYROLL_CONFIG_REGISTRY_ADDRESS) return null;

    // Check network
    const currentProvider = provider!; // Non-null assertion since we checked above
    try {
      const network = await currentProvider.getNetwork();
      if (network.chainId !== BigInt(421614)) {
        showError("Please switch to Arbitrum Sepolia network");
        return null;
      }
    } catch (error) {
      console.error("Failed to get network:", error);
      showError("Failed to detect network");
      return null;
    }

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        PAYROLL_CONFIG_REGISTRY_ADDRESS,
        REGISTRY_ABI,
        currentProvider
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
      showError("Failed to load configuration");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConfig = async (configId: bigint) => {
    if (!signer || !address || !provider || !PAYROLL_CONFIG_REGISTRY_ADDRESS) {
      showInfo("Please connect your wallet");
      return;
    }

    // Check network
    const currentProvider = provider!; // Non-null assertion since we checked above
    try {
      const network = await currentProvider.getNetwork();
      if (network.chainId !== BigInt(421614)) {
        showError("Please switch to Arbitrum Sepolia network");
        return;
      }
    } catch (error) {
      console.error("Failed to get network:", error);
      showError("Failed to detect network");
      return;
    }

    // confirmはUI側に任せる想定。ここではそのまま実行。

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
      showSuccess("Configuration deleted successfully");
      loadConfigList();
    } catch (error: any) {
      console.error("Failed to delete config:", error);
      showError("Failed to delete configuration: " + (error.message || error));
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
