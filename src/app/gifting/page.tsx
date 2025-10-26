"use client";
import React, { useState, useEffect } from "react";
import { GiftingManager } from "../_components/gifting/GiftingManager";
import { COLORS } from "../_components/gifting/design-tokens";
import { NetworkGateModal } from "../_components/shared/NetworkGateModal";
import { ethers } from "ethers";

const ARBITRUM_SEPOLIA_CHAIN_ID = "0x66eee";
const ARBITRUM_SEPOLIA_PARAMS = {
  chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
  chainName: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://arbitrum-sepolia.drpc.org'],
  blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
};

export default function GiftingPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [showGate, setShowGate] = useState(true);

  useEffect(() => {
    checkWalletAndNetwork();

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          checkWalletAndNetwork();
        } else {
          setAddress(null);
          setShowGate(true);
        }
      };

      const handleChainChanged = () => {
        checkWalletAndNetwork();
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      return () => {
        (window as any).ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const checkWalletAndNetwork = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_accounts", []);
        
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          const network = await provider.getNetwork();
          const currentChainIdHex = ("0x" + network.chainId.toString(16)).toLowerCase();
          const isCorrect = currentChainIdHex === ARBITRUM_SEPOLIA_CHAIN_ID;
          setIsCorrectNetwork(isCorrect);
          setShowGate(!isCorrect);
        } else {
          setAddress(null);
          setIsCorrectNetwork(false);
          setShowGate(true);
        }
      } catch (error) {
        console.error("Failed to check wallet:", error);
        setShowGate(true);
      }
    }
  };

  const handleConnectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          await checkWalletAndNetwork();
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  const handleSwitchNetwork = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }],
        });
        await checkWalletAndNetwork();
      } catch (switchError: any) {
        if (switchError?.code === 4902) {
          try {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [ARBITRUM_SEPOLIA_PARAMS],
            });
            await checkWalletAndNetwork();
          } catch (addError) {
            console.error("Failed to add network:", addError);
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen">
      <NetworkGateModal
        isOpen={showGate}
        address={address}
        isCorrectNetwork={isCorrectNetwork}
        onConnectWallet={handleConnectWallet}
        onSwitchNetwork={handleSwitchNetwork}
        networkName="Arbitrum Sepolia"
      />
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          <h1 className={`text-4xl md:text-5xl ${COLORS.textPrimary} font-bold`}>
            Gifting Manager
          </h1>
          <p className={`text-lg ${COLORS.textSecondary} max-w-3xl mx-auto`}>
            Percentage-based USDC gifting with DeFi strategy allocations and cross-chain execution
          </p>

          {/* Info Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm">
                <span className={COLORS.textSecondary}>Network:</span>{' '}
                <span className="font-semibold text-blue-600">Arbitrum Sepolia</span>
              </span>
            </div>
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm">
                <span className={COLORS.textSecondary}>Token:</span>{' '}
                <span className="font-semibold text-green-600">USDC</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Gifting Manager */}
        <GiftingManager />
      </div>
    </div>
  );
}

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';
