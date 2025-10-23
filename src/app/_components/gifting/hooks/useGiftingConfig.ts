"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { TOKEN_CONTRACT_ADDRESSES, TOKEN_METADATA } from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";
import { DeFiStrategy, Recipient, RecipientGroup } from "../types";
import { buildFlatRecipientsFromGroups, isValidAddress, sumPercent, toContractRecipients } from "../utils";
import { useWallet } from "../components/configManager/useWallet";
import { useConfigRegistry } from "../components/configManager/useConfigRegistry";

export function useGiftingConfig() {
  const [recipientGroups, setRecipientGroups] = useState<RecipientGroup[]>([]);

  const params = useParams();
  const { provider, signer, address } = useWallet();
  const { loadConfig } = useConfigRegistry(provider, signer, address);
  const [autoLoadedId, setAutoLoadedId] = useState<string | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const currentId = useMemo(() => {
    const p: any = params as any;
    return typeof p?.id === "string" ? p.id : Array.isArray(p?.id) ? p?.id?.[0] : undefined;
  }, [params]);

  const onLoadConfig = (loadedRecipients: Recipient[]) => {
    const groups: RecipientGroup[] = [];
    const walletMap = new Map<string, { sharePercent: number; strategies: Map<DeFiStrategy, number> }>();

    loadedRecipients.forEach((r) => {
      const pct = parseFloat(r.sharePercent) || 0;
      if (!walletMap.has(r.wallet)) {
        walletMap.set(r.wallet, { sharePercent: 0, strategies: new Map() });
      }
      const entry = walletMap.get(r.wallet)!;
      entry.sharePercent += pct;
      entry.strategies.set(r.strategy, (entry.strategies.get(r.strategy) || 0) + pct);
    });

    walletMap.forEach((data, wallet) => {
      const strategies = [
        { strategy: DeFiStrategy.DIRECT_TRANSFER, subPercent: "0" },
        { strategy: DeFiStrategy.AAVE_SUPPLY, subPercent: "0" },
        { strategy: DeFiStrategy.MORPHO_DEPOSIT, subPercent: "0" },
        { strategy: DeFiStrategy.UNISWAP_V2_SWAP, subPercent: "0" },
      ];

      data.strategies.forEach((pct, strategy) => {
        const subPct = data.sharePercent > 0 ? (pct / data.sharePercent) * 100 : 0;
        const idx = strategies.findIndex((s) => s.strategy === strategy);
        if (idx >= 0) strategies[idx].subPercent = subPct.toString();
      });

      groups.push({ wallet, sharePercent: data.sharePercent.toString(), strategies });
    });

    setRecipientGroups(groups.length > 0 ? groups : []);
  };

  useEffect(() => {
    const idStr = currentId;
    if (!idStr) return;
    if (autoLoadedId === idStr) return;
    try {
      setIsLoadingConfig(true);
      setNotFound(false);
      const id = BigInt(idStr);
      loadConfig(id).then((cfg) => {
        if (cfg && cfg.recipients) {
          onLoadConfig(cfg.recipients);
          setAutoLoadedId(idStr);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      }).finally(() => {
        setIsLoadingConfig(false);
      });
    } catch {}
  }, [currentId, autoLoadedId, loadConfig]);

  const flatRecipients = useMemo(() => buildFlatRecipientsFromGroups(recipientGroups), [recipientGroups]);
  const totalRecipientPercent = useMemo(
    () => recipientGroups.reduce((s, g) => s + (parseFloat(g.sharePercent) || 0), 0),
    [recipientGroups]
  );

  const validationMessages = useMemo(() => {
    const msgs: string[] = [];
    if (recipientGroups.length > 0 && Math.abs(totalRecipientPercent - 100) >= 0.01) msgs.push("Recipients Total must be 100%");
    recipientGroups.forEach((g, i) => {
      const s = sumPercent(g.strategies.map((x) => x.subPercent));
      if (Math.abs(s - 100) >= 0.01) msgs.push(`Recipient ${i + 1}: Strategies Total must be 100%`);
      if (!isValidAddress(g.wallet)) msgs.push(`Recipient ${i + 1}: Invalid address`);
    });
    if (flatRecipients.length > 20) msgs.push("Recipients exceed 20");
    return msgs;
  }, [recipientGroups, totalRecipientPercent, flatRecipients]);

  const isValid = validationMessages.length === 0;

  const prefillConfig = useMemo(() => ({ toChainId: 421614 as const, token: "USDC" as const }), []);

  const buildFunctionParams = (token: string, amount: string, chainId: number, userAddress?: string) => {
    const decimals = TOKEN_METADATA[token].decimals;
    const amountWei = parseUnits(amount, decimals);
    const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
    const contractRecipients = toContractRecipients(flatRecipients);
    return {
      functionParams: [tokenAddress, amountWei, contractRecipients] as const,
    };
  };

  return {
    recipientGroups,
    setRecipientGroups,
    flatRecipients,
    validationMessages,
    isValid,
    prefillConfig,
    buildFunctionParams,
    onLoadConfig,
    currentId,
    isLoadingConfig,
    notFound,
  };
}
