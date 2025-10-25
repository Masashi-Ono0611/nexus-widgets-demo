import { Recipient } from "../../types";

export interface ConfigManagerProps {
  recipients: Recipient[];
  onLoadConfig: (recipients: Recipient[]) => void;
}

export interface SavedConfig {
  id: bigint;
  name: string;
  description: string;
  owner: string;
  isPublic: boolean;
  recipientCount: bigint;
}
