import { useState } from "react";
import { ethers } from "ethers";
import { WalletGroup, DeFiStrategy, PAYROLL_CONFIG_REGISTRY_ADDRESS } from "../../types";
import { SavedConfig } from "./types";
import { REGISTRY_ABI } from "./abi";
import { toast } from "sonner";

export function useConfigRegistry(
  provider: ethers.BrowserProvider | null,
  signer: ethers.JsonRpcSigner | null,
  address: string | null
) {
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const showSuccess = (message: string) => toast.success(message);
  const showError = (message: string) => toast.error(message);
  const showInfo = (message: string) => toast.info(message);

  // Helper functions
  const checkPrerequisites = (requireSigner = false): boolean => {
    if (!provider || !PAYROLL_CONFIG_REGISTRY_ADDRESS) {
      if (!provider) showInfo("Please connect your wallet");
      if (!PAYROLL_CONFIG_REGISTRY_ADDRESS) showError("Registry contract not configured");
      return false;
    }

    if (requireSigner && (!signer || !address)) {
      showInfo("Please connect your wallet");
      return false;
    }

    return true;
  };

  const createSchedule = (scheduleEnabled: boolean, intervalMinutes: string, maxExecutions: string) => ({
    enabled: scheduleEnabled,
    intervalMinutes: BigInt(intervalMinutes || "0"),
    maxExecutions: BigInt(maxExecutions || "0"),
  });

  const checkNetwork = async (provider: ethers.BrowserProvider): Promise<boolean> => {
    try {
      const network = await provider.getNetwork();
      
      if (network.chainId !== BigInt(421614)) {
        console.log(`Wrong network: ${network.name} (${network.chainId}), expected Arbitrum Sepolia (421614)`);
        showError("Please switch to Arbitrum Sepolia network");
        return false;
      }
      
      console.log(`✅ Network check successful: Arbitrum Sepolia (${network.chainId})`);
      return true;
    } catch (error: any) {
      console.error("Failed to get network:", error);
      showError("Network detection failed. Please refresh the page and try again.");
      return false;
    }
  };

  const createContract = (useSigner = false) => {
    return new ethers.Contract(
      PAYROLL_CONFIG_REGISTRY_ADDRESS,
      REGISTRY_ABI,
      useSigner ? signer! : provider!
    );
  };

  const validateWalletGroups = (walletGroups: WalletGroup[]): boolean => {
    if (walletGroups.length === 0) {
      showInfo("At least one wallet group required");
      return false;
    }
    if (walletGroups.length > 5) {
      showInfo("Maximum 5 wallet groups allowed");
      return false;
    }

    for (let i = 0; i < walletGroups.length; i++) {
      const group = walletGroups[i];

      // Validate wallet address
      if (!group.wallet || !ethers.isAddress(group.wallet)) {
        showInfo(`Invalid wallet address in group ${i + 1}`);
        return false;
      }

      // Validate wallet amount
      const amount = parseFloat(group.walletAmount || "0");
      if (amount <= 0) {
        showInfo(`Invalid wallet amount in group ${i + 1}`);
        return false;
      }

      // Validate strategies
      if (group.strategies.length === 0) {
        showInfo(`At least one strategy required in group ${i + 1}`);
        return false;
      }
      if (group.strategies.length > 4) {
        showInfo(`Maximum 4 strategies allowed in group ${i + 1}`);
        return false;
      }

      // Validate strategy percentages
      const totalPercent = group.strategies.reduce((sum, s) => sum + parseFloat(s.subPercent || "0"), 0);
      if (Math.abs(totalPercent - 100) > 0.01) {
        showInfo(`Strategy percentages must total 100% in group ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const transformWalletGroups = (walletGroups: WalletGroup[]) => {
    return walletGroups.map((group) => ({
      wallet: group.wallet,
      walletAmount: ethers.parseUnits(group.walletAmount || "0", 6),
      strategies: group.strategies.map((s) => ({
        strategy: s.strategy,
        subPercent: Math.round(parseFloat(s.subPercent) * 100),
      })),
    }));
  };

  const loadConfigList = async () => {
    if (!checkPrerequisites()) return;

    // Check network
    if (!(await checkNetwork(provider!))) return;

    setIsLoading(true);
    try {
      const contract = createContract();

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
    if (!checkPrerequisites(true)) return; // requireSigner = true

    if (!configName.trim()) {
      showInfo("Please enter a configuration name");
      return;
    }

    if (!validateWalletGroups(walletGroups)) return;

    // Check network
    if (!(await checkNetwork(provider!))) return;

    setIsSaving(true);
    try {
      const contractWalletGroups = transformWalletGroups(walletGroups);
      const schedule = createSchedule(scheduleEnabled, intervalMinutes, maxExecutions);

      const contract = createContract(true); // useSigner = true

      const tx = await contract.saveConfig(
        configName,
        configDescription,
        contractWalletGroups,
        schedule,
        isPublic
      );
      const receipt = await tx.wait();

      console.log("Transaction hash:", receipt.hash);
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
    if (!checkPrerequisites(true)) return; // requireSigner = true

    if (!configName.trim()) {
      showInfo("Please enter a configuration name");
      return;
    }

    if (!validateWalletGroups(walletGroups)) return;

    // Check network
    if (!(await checkNetwork(provider!))) return;

    setIsSaving(true);
    try {
      const contractWalletGroups = transformWalletGroups(walletGroups);
      const schedule = createSchedule(scheduleEnabled, intervalMinutes, maxExecutions);

      const contract = createContract(true); // useSigner = true

      const tx = await contract.updateConfig(
        configId,
        configName,
        configDescription,
        contractWalletGroups,
        schedule
      );
      const receipt = await tx.wait();

      console.log("Transaction hash:", receipt.hash);
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
    if (!checkPrerequisites()) return null;

    // Check network
    if (!(await checkNetwork(provider!))) return null;

    setIsLoading(true);
    try {
      const contract = createContract();

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

          // Convert strategy enum to number
          const strategyEnum = Number(strategy[0]);
          const strategyPercent = Number(strategy[1]) / 100;

          strategies.push({
            strategy: strategyEnum as DeFiStrategy,
            subPercent: String(strategyPercent),
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
    if (!checkPrerequisites(true)) return; // requireSigner = true

    // Check network
    if (!(await checkNetwork(provider!))) return;

    try {
      const contract = createContract(true); // useSigner = true

      const tx = await contract.deleteConfig(configId);
      const receipt = await tx.wait();

      console.log("Delete transaction hash:", receipt.hash);
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
