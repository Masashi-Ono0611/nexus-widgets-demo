import { WalletGroup } from "../../types";

export interface ConfigManagerProps {
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

export interface SavedConfig {
  id: bigint;
  name: string;
  description: string;
  owner: string;
  isPublic: boolean;
  walletGroupCount: bigint;
}
