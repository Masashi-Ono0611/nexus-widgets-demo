import { Recipient, RecipientGroup } from "./types";

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

export function buildFlatRecipientsFromGroups(groups: RecipientGroup[]): Recipient[] {
  const result: Recipient[] = [];
  for (const g of groups) {
    const groupPct = parseFloat(g.sharePercent) || 0;
    for (const s of g.strategies) {
      const sub = parseFloat(s.subPercent) || 0;
      const overallPercent = (groupPct * sub) / 100;
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
