"use client";

import React from "react";
import {
  Address,
  WalletClient,
  createWalletClient,
  custom,
  formatUnits,
  parseUnits,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import {
  CONTRACT_ADDRESS,
  DEFAULT_ASSET,
  RPC_URL,
  erc20Abi,
  vaultAbi,
  publicClient,
} from "./config";

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected error";
}

export function useMorphoVault() {
  const [account, setAccount] = React.useState<Address | null>(null);
  const [walletClient, setWalletClient] = React.useState<WalletClient | null>(null);
  const [assetAddress, setAssetAddress] = React.useState<string>(DEFAULT_ASSET);
  const [depositAmount, setDepositAmount] = React.useState<string>("0.0");
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>("0.0");
  const [vaultShares, setVaultShares] = React.useState<string>("-");
  const [vaultSharesValue, setVaultSharesValue] = React.useState<string>("-");
  const [totalAssets, setTotalAssets] = React.useState<string>("-");
  const [tokenBalance, setTokenBalance] = React.useState<string>("-");
  const [allowance, setAllowance] = React.useState<string>("-");
  const [status, setStatus] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const fetchDecimals = React.useCallback(async (token: Address): Promise<number> => {
    const decimals = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "decimals",
      args: [],
    });
    return Number(decimals);
  }, []);

  const syncTokenInfo = React.useCallback(
    async (overrideAccount?: Address) => {
      const activeAccount = overrideAccount ?? account;
      if (!activeAccount) {
        setTokenBalance("-");
        setAllowance("-");
        return;
      }
      try {
        setStatus("Fetching token info...");
        setError("");
        const token = assetAddress as Address;
        const decimals = await fetchDecimals(token);
        const [balance, allowanceValue] = await Promise.all([
          publicClient.readContract({
            address: token,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [activeAccount],
          }),
          publicClient.readContract({
            address: token,
            abi: erc20Abi,
            functionName: "allowance",
            args: [activeAccount, CONTRACT_ADDRESS],
          }),
        ]);
        setTokenBalance(formatUnits(balance, decimals));
        setAllowance(formatUnits(allowanceValue, decimals));
        setStatus("Token info updated");
      } catch (err) {
        setError(formatError(err));
        setStatus("");
      }
    },
    [account, assetAddress, fetchDecimals],
  );

  const syncVaultInfo = React.useCallback(
    async (overrideAccount?: Address) => {
      const activeAccount = overrideAccount ?? account;
      if (!activeAccount) {
        setVaultShares("-");
        setVaultSharesValue("-");
        setTotalAssets("-");
        return;
      }
      try {
        setStatus("Fetching vault info...");
        setError("");
        const token = assetAddress as Address;
        const decimals = await fetchDecimals(token);
        const [shares, total] = await Promise.all([
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: vaultAbi,
            functionName: "balanceOf",
            args: [activeAccount],
          }),
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: vaultAbi,
            functionName: "totalAssets",
            args: [],
          }),
        ]);
        
        let assetsValue = BigInt(0);
        if (shares > BigInt(0)) {
          assetsValue = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: vaultAbi,
            functionName: "convertToAssets",
            args: [shares],
          });
        }
        
        setVaultShares(formatUnits(shares, decimals));
        setVaultSharesValue(formatUnits(assetsValue, decimals));
        setTotalAssets(formatUnits(total, decimals));
        setStatus("Vault info updated");
      } catch (err) {
        setError(formatError(err));
        setStatus("");
      }
    },
    [account, assetAddress, fetchDecimals],
  );

  const ensureWallet = React.useCallback(async () => {
    const eth = (globalThis as any)?.ethereum;
    if (!eth) {
      throw new Error("Wallet provider not found. Please install or enable your wallet.");
    }
    const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts returned from wallet.");
    }
    const selectedAccount = accounts[0] as Address;

    let chainIdHex: string | undefined = eth.chainId as string | undefined;
    if (!chainIdHex) {
      chainIdHex = (await eth.request({ method: "eth_chainId" })) as string;
    }
    if (!chainIdHex) {
      throw new Error("Unable to determine network. Please try again.");
    }
    const currentChainId = Number.parseInt(chainIdHex, 16);
    if (currentChainId !== arbitrumSepolia.id) {
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${arbitrumSepolia.id.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError?.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${arbitrumSepolia.id.toString(16)}`,
                chainName: "Arbitrum Sepolia",
                nativeCurrency: { name: "Arbitrum Sepolia Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: ["https://sepolia.arbiscan.io"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    const client = createWalletClient({
      account: selectedAccount,
      chain: arbitrumSepolia,
      transport: custom(eth),
    });
    setAccount(selectedAccount);
    setWalletClient(client);
    setStatus("Wallet connected");
    setError("");
    return { client, account: selectedAccount };
  }, []);

  const getWallet = React.useCallback(async () => {
    if (walletClient && account) {
      return { client: walletClient, account };
    }
    return ensureWallet();
  }, [walletClient, account, ensureWallet]);

  const handleConnect = React.useCallback(async () => {
    try {
      const { account: connectedAccount } = await ensureWallet();
      await Promise.all([syncTokenInfo(connectedAccount), syncVaultInfo(connectedAccount)]);
    } catch (err) {
      setError(formatError(err));
    }
  }, [ensureWallet, syncTokenInfo, syncVaultInfo]);

  const handleApprove = React.useCallback(async () => {
    try {
      const { client, account: userAccount } = await getWallet();
      if (!userAccount) {
        throw new Error("Unable to determine connected account.");
      }
      const token = assetAddress as Address;
      const decimals = await fetchDecimals(token);
      const parsedAmount = parseUnits(depositAmount, decimals);
      const hash = await client.writeContract({
        account: userAccount,
        chain: arbitrumSepolia,
        address: token,
        abi: erc20Abi,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, parsedAmount],
      });
      setStatus(`Approve tx sent: ${hash}`);
      setError("");
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("Approve confirmed");
      await syncTokenInfo(userAccount);
    } catch (err) {
      setError(formatError(err));
      setStatus("");
    }
  }, [assetAddress, fetchDecimals, getWallet, depositAmount, syncTokenInfo]);

  const handleDeposit = React.useCallback(async () => {
    try {
      const { client, account: userAccount } = await getWallet();
      if (!userAccount) {
        throw new Error("Unable to determine connected account.");
      }
      const token = assetAddress as Address;
      const decimals = await fetchDecimals(token);
      const parsedAmount = parseUnits(depositAmount, decimals);
      const txHash = await client.writeContract({
        account: userAccount,
        chain: arbitrumSepolia,
        address: CONTRACT_ADDRESS,
        abi: vaultAbi,
        functionName: "deposit",
        args: [parsedAmount, userAccount],
      });
      setStatus(`Deposit tx sent: ${txHash}`);
      setError("");
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setStatus("Deposit confirmed");
      await Promise.all([syncTokenInfo(userAccount), syncVaultInfo(userAccount)]);
    } catch (err) {
      setError(formatError(err));
      setStatus("");
    }
  }, [assetAddress, fetchDecimals, getWallet, depositAmount, syncTokenInfo, syncVaultInfo]);

  const handleWithdraw = React.useCallback(async () => {
    try {
      const { client, account: userAccount } = await getWallet();
      if (!userAccount) {
        throw new Error("Unable to determine connected account.");
      }
      const token = assetAddress as Address;
      const decimals = await fetchDecimals(token);
      const parsedAmount = parseUnits(withdrawAmount, decimals);
      const txHash = await client.writeContract({
        account: userAccount,
        chain: arbitrumSepolia,
        address: CONTRACT_ADDRESS,
        abi: vaultAbi,
        functionName: "withdraw",
        args: [parsedAmount, userAccount, userAccount],
      });
      setStatus(`Withdraw tx sent: ${txHash}`);
      setError("");
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setStatus("Withdraw confirmed");
      await Promise.all([syncTokenInfo(userAccount), syncVaultInfo(userAccount)]);
    } catch (err) {
      setError(formatError(err));
      setStatus("");
    }
  }, [assetAddress, fetchDecimals, getWallet, syncVaultInfo, syncTokenInfo, withdrawAmount]);

  const refreshTokenInfo = React.useCallback(async () => {
    await syncTokenInfo(account ?? undefined);
  }, [account, syncTokenInfo]);

  const refreshVaultInfo = React.useCallback(async () => {
    await syncVaultInfo(account ?? undefined);
  }, [account, syncVaultInfo]);

  React.useEffect(() => {
    if (!account) return;
    void syncTokenInfo(account);
    void syncVaultInfo(account);
  }, [account, syncTokenInfo, syncVaultInfo]);

  return {
    account,
    assetAddress,
    depositAmount,
    withdrawAmount,
    vaultShares,
    vaultSharesValue,
    totalAssets,
    tokenBalance,
    allowance,
    status,
    error,
    setAssetAddress,
    setDepositAmount,
    setWithdrawAmount,
    handleConnect,
    handleApprove,
    handleDeposit,
    handleWithdraw,
    refreshTokenInfo,
    refreshVaultInfo,
  };
}

export { formatError };
