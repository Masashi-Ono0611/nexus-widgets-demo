import { useState, useEffect } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const initProvider = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
          setProvider(ethProvider);

          // Get current network info
          const network = await ethProvider.getNetwork();
          console.log(`🌐 Connected to ${network.name} (Chain ID: ${network.chainId})`);

          // Get accounts
          const accounts = await ethProvider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            const ethSigner = await ethProvider.getSigner();
            setSigner(ethSigner);
          }
          setNetworkError(null);
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
        initProvider();
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      return () => {
        (window as any).ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return { mounted, address, provider, signer, networkError };
}
