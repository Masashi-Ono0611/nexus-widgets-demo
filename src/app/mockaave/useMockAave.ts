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
import { baseSepolia } from "viem/chains";
import {
  CONTRACT_ADDRESS,
  DEFAULT_ASSET,
  RPC_URL,
  erc20Abi,
  poolAbi,
  publicClient,
} from "./config";

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected error";
}

export function useMockAave() {
  const [account, setAccount] = React.useState<Address | null>(null);
  const [walletClient, setWalletClient] = React.useState<WalletClient | null>(null);
  const [assetAddress, setAssetAddress] = React.useState<string>(DEFAULT_ASSET);
  const [supplyAmount, setSupplyAmount] = React.useState<string>("0.0");
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>("0.0");
  const [supplyBalance, setSupplyBalance] = React.useState<string>("-");
  const [totalSupplied, setTotalSupplied] = React.useState<string>("-");
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

  const syncSupplyInfo = React.useCallback(
    async (overrideAccount?: Address) => {
      const activeAccount = overrideAccount ?? account;
      if (!activeAccount) {
        setSupplyBalance("-");
        setTotalSupplied("-");
        return;
      }
      try {
        setStatus("Fetching supply info...");
        setError("");
        const token = assetAddress as Address;
        const decimals = await fetchDecimals(token);
        const [userSupply, total] = await Promise.all([
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: poolAbi,
            functionName: "getSupplyBalance",
            args: [activeAccount, token],
          }),
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: poolAbi,
            functionName: "getTotalSupplied",
            args: [token],
          }),
        ]);
        setSupplyBalance(formatUnits(userSupply, decimals));
        setTotalSupplied(formatUnits(total, decimals));
        setStatus("Supply info updated");
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
    if (currentChainId !== baseSepolia.id) {
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${baseSepolia.id.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError?.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${baseSepolia.id.toString(16)}`,
                chainName: "Base Sepolia",
                nativeCurrency: { name: "Base Sepolia Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: ["https://sepolia.basescan.org"],
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
      chain: baseSepolia,
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
      await Promise.all([syncTokenInfo(connectedAccount), syncSupplyInfo(connectedAccount)]);
    } catch (err) {
      setError(formatError(err));
    }
  }, [ensureWallet, syncTokenInfo, syncSupplyInfo]);

  const handleApprove = React.useCallback(async () => {
    try {
      const { client, account: userAccount } = await getWallet();
      if (!userAccount) {
        throw new Error("Unable to determine connected account.");
      }
      const token = assetAddress as Address;
      const decimals = await fetchDecimals(token);
      const parsedAmount = parseUnits(supplyAmount, decimals);
      const hash = await client.writeContract({
        account: userAccount,
        chain: baseSepolia,
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
  }, [assetAddress, fetchDecimals, getWallet, supplyAmount, syncTokenInfo]);

  const handleSupply = React.useCallback(async () => {
    try {
      const { client, account: userAccount } = await getWallet();
      if (!userAccount) {
        throw new Error("Unable to determine connected account.");
      }
      const token = assetAddress as Address;
      const decimals = await fetchDecimals(token);
      const parsedAmount = parseUnits(supplyAmount, decimals);
      const txHash = await client.writeContract({
        account: userAccount,
        chain: baseSepolia,
        address: CONTRACT_ADDRESS,
        abi: poolAbi,
        functionName: "supply",
        args: [token, parsedAmount, userAccount, 0],
      });
      setStatus(`Supply tx sent: ${txHash}`);
      setError("");
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setStatus("Supply confirmed");
      await Promise.all([syncTokenInfo(userAccount), syncSupplyInfo(userAccount)]);
    } catch (err) {
      setError(formatError(err));
      setStatus("");
    }
  }, [assetAddress, fetchDecimals, getWallet, supplyAmount, syncTokenInfo, syncSupplyInfo]);

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
        chain: baseSepolia,
        address: CONTRACT_ADDRESS,
        abi: poolAbi,
        functionName: "withdraw",
        args: [token, parsedAmount, userAccount],
      });
      setStatus(`Withdraw tx sent: ${txHash}`);
      setError("");
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setStatus("Withdraw confirmed");
      await Promise.all([syncTokenInfo(userAccount), syncSupplyInfo(userAccount)]);
    } catch (err) {
      setError(formatError(err));
      setStatus("");
    }
  }, [assetAddress, fetchDecimals, getWallet, syncSupplyInfo, syncTokenInfo, withdrawAmount]);

  const refreshTokenInfo = React.useCallback(async () => {
    await syncTokenInfo(account ?? undefined);
  }, [account, syncTokenInfo]);

  const refreshSupplyInfo = React.useCallback(async () => {
    await syncSupplyInfo(account ?? undefined);
  }, [account, syncSupplyInfo]);

  React.useEffect(() => {
    if (!account) return;
    void syncTokenInfo(account);
    void syncSupplyInfo(account);
  }, [account, syncTokenInfo, syncSupplyInfo]);

  return {
    account,
    assetAddress,
    supplyAmount,
    withdrawAmount,
    supplyBalance,
    totalSupplied,
    tokenBalance,
    allowance,
    status,
    error,
    setAssetAddress,
    setSupplyAmount,
    setWithdrawAmount,
    handleConnect,
    handleApprove,
    handleSupply,
    handleWithdraw,
    refreshTokenInfo,
    refreshSupplyInfo,
  };
}

export { formatError };
