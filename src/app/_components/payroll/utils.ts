import { Recipient, WalletGroup } from "./types";

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

export function sumPercent(values: string[]): number {
  return values.reduce((s, v) => s + (parseFloat(v) || 0), 0);
}

export function buildFlatRecipientsFromGroups(groups: WalletGroup[], totalAmount: number): Recipient[] {
  const result: Recipient[] = [];
  if (!totalAmount || totalAmount <= 0) return result;
  for (const g of groups) {
    const walletAmt = parseFloat(g.walletAmount) || 0;
    const walletPct = (walletAmt / totalAmount) * 100; // wallet share in %
    for (const s of g.strategies) {
      const sub = parseFloat(s.subPercent) || 0;
      const overallPercent = (walletPct * sub) / 100; // overall % of total
      if (overallPercent > 0) {
        result.push({
          wallet: g.wallet,
          sharePercent: overallPercent.toString(),
          strategy: s.strategy,
        });
      }
    }
  }
  return result;
}
