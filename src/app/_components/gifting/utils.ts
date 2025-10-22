import { Recipient } from "./types";

export function isValidAddress(addr: string): boolean {
  return !!addr && addr.startsWith("0x") && addr.length === 42;
}

export function toContractRecipients(recipients: Recipient[]) {
  return recipients.map((r) => ({
    wallet: r.wallet as `0x${string}`,
    sharePercent: Math.round(parseFloat(r.sharePercent || "0") * 100),
    strategy: r.strategy,
  }));
}

export function totalShare(recipients: Recipient[]): number {
  return recipients.reduce((sum, r) => sum + (parseFloat(r.sharePercent) || 0), 0);
}
