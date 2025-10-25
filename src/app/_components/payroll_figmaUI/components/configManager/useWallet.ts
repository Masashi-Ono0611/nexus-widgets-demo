import { useState, useEffect } from "react";
import { ethers } from "ethers";

const ARBITRUM_SEPOLIA_CHAIN_ID = "0x66eee"; // 421614 in hex (lowercase for strict compare)
const ARBITRUM_SEPOLIA_PARAMS = {
  chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
  chainName: 'Arbitrum Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://arbitrum-sepolia.drpc.org'],
  blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
};

export function useWallet() {
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [needsNetworkSwitch, setNeedsNetworkSwitch] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    const initProvider = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
          setProvider(ethProvider);

          // Check current network
          const network = await ethProvider.getNetwork();
          const currentChainIdHex = ("0x" + network.chainId.toString(16)).toLowerCase();

          if (currentChainIdHex !== ARBITRUM_SEPOLIA_CHAIN_ID) {
            console.log(`🌐 Wrong network detected: ${network.name} (${currentChainIdHex})`);
            console.log(`🔄 Please switch to Arbitrum Sepolia...`);
            setIsCorrectNetwork(false);
            setNeedsNetworkSwitch(true);
            setNetworkError(`Please switch to Arbitrum Sepolia network. Current: ${network.name}`);
          } else {
            console.log("✅ Connected to Arbitrum Sepolia");
            setIsCorrectNetwork(true);
            setNeedsNetworkSwitch(false);
            setNetworkError(null);
          }

          // Get accounts after network check
          const accounts = await ethProvider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            const ethSigner = await ethProvider.getSigner();
            setSigner(ethSigner);
          }
        } catch (error) {
          console.error("Failed to initialize provider:", error);
          setNetworkError("Failed to connect to wallet");
        }
      } else {
        setNetworkError("No Ethereum wallet detected");
      }
    };

    initProvider();

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          initProvider();
        } else {
          setAddress(null);
          setSigner(null);
        }
      };

      const handleChainChanged = () => {
        console.log("🔄 Chain changed, reinitializing...");
        // Force page reload to ensure clean provider state
        window.location.reload();
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      return () => {
        (window as any).ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const promptSwitchNetwork = async () => {
    if (!(typeof window !== "undefined" && (window as any).ethereum)) return;
    try {
      // Ensure account connection before requesting chain switch
      if (!address) {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      }
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }],
      });
      setIsCorrectNetwork(true);
      setNeedsNetworkSwitch(false);
      setNetworkError(null);
    } catch (switchError: any) {
      if (switchError?.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ARBITRUM_SEPOLIA_PARAMS],
          });
          setIsCorrectNetwork(true);
          setNeedsNetworkSwitch(false);
          setNetworkError(null);
        } catch (addError) {
          setNetworkError("Please add Arbitrum Sepolia network manually in your wallet.");
        }
      } else {
        setNetworkError("Network switch was cancelled or failed.");
      }
    }
  };

  return { mounted, address, provider, signer, networkError, isCorrectNetwork, needsNetworkSwitch, promptSwitchNetwork };
}
