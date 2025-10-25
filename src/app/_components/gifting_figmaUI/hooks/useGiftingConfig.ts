"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { TOKEN_CONTRACT_ADDRESSES, TOKEN_METADATA } from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";
import { DeFiStrategy, Recipient, RecipientWallet, STRATEGY_TEMPLATES, WALLET_COLORS, STRATEGY_LABELS } from "../types";
import { convertToRecipients, calculateTotalPercentage, validateRecipientWallets } from "../utils";
import { useWallet } from "../components/configManager/useWallet";
import { useConfigRegistry } from "../components/configManager/useConfigRegistry";
import { COLORS } from "../design-tokens";

export function useGiftingConfig() {
  const [recipientWallets, setRecipientWallets] = useState<RecipientWallet[]>([
    {
      id: '1',
      address: '',
      sharePercent: 100,
      color: WALLET_COLORS[0],
      strategies: STRATEGY_TEMPLATES,
    },
  ]);

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
    // Group recipients by wallet address
    const walletGroups = new Map<string, Recipient[]>();

    loadedRecipients.forEach((recipient) => {
      if (!walletGroups.has(recipient.wallet)) {
        walletGroups.set(recipient.wallet, []);
      }
      walletGroups.get(recipient.wallet)!.push(recipient);
    });

    // Convert to RecipientWallet[]
    const loadedWallets: RecipientWallet[] = Array.from(walletGroups.entries()).map(([walletAddress, recipients], index) => {
      // Calculate total share for this wallet
      const totalShare = recipients.reduce((sum, r) => sum + parseFloat(r.sharePercent), 0);

      // Build strategies for all enums (0..3), fill missing with 0%
      const strategies = STRATEGY_TEMPLATES.map((tpl) => {
        const found = recipients.find((r) => r.strategy === tpl.strategyEnum);
        const pct = found && totalShare > 0 ? (parseFloat(found.sharePercent) / totalShare) * 100 : 0;
        return {
          name: STRATEGY_LABELS[tpl.strategyEnum],
          percentage: pct,
          color: COLORS.brand.secondary.text,
          address: '0x0000000000000000000000000000000000000001',
          strategyEnum: tpl.strategyEnum,
        };
      });

      return {
        id: Date.now().toString() + index,
        address: walletAddress,
        sharePercent: totalShare,
        color: WALLET_COLORS[index % WALLET_COLORS.length],
        strategies,
      };
    });

    setRecipientWallets(loadedWallets);
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

  const recipients = useMemo(() => convertToRecipients(recipientWallets), [recipientWallets]);
  const totalShareValue = useMemo(() => calculateTotalPercentage(recipientWallets), [recipientWallets]);
  const errors = useMemo(() => validateRecipientWallets(recipientWallets), [recipientWallets]);

  const isValid = useMemo(() => {
    const recipientsOk = recipientWallets.every((w) => w.address && w.address.startsWith('0x') && w.address.length === 42);
    const shareOk = Math.abs(totalShareValue - 100) < 0.01;
    const recipientCountOk = recipientWallets.length <= 5;
    const eachShareValid = recipientWallets.every((w) => w.sharePercent > 0 && w.sharePercent <= 100);

    return recipientsOk && shareOk && recipientCountOk && eachShareValid;
  }, [recipientWallets, totalShareValue]);

  const prefillConfig = useMemo(() => ({ toChainId: 421614 as const, token: "USDC" as const }), []);

  const buildFunctionParams = (token: string, amount: string, chainId: number, userAddress?: string) => {
    const decimals = TOKEN_METADATA[token].decimals;
    const totalAmountWei = parseUnits(amount, decimals);
    const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];

    const contractRecipients = recipients.map(r => ({
      wallet: r.wallet as `0x${string}`,
      sharePercent: Math.round(parseFloat(r.sharePercent) * 100),
      strategy: r.strategy,
    }));

    return {
      functionParams: [tokenAddress, totalAmountWei, contractRecipients] as const,
    };
  };

  return {
    recipientWallets,
    setRecipientWallets,
    recipients,
    errors,
    isValid,
    prefillConfig,
    buildFunctionParams,
    onLoadConfig,
    currentId,
    isLoadingConfig,
    notFound,
    totalShareValue,
  };
}
