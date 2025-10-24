import { useState, useEffect } from "react";
import { ethers } from "ethers";

const ARBITRUM_SEPOLIA_CHAIN_ID = "0x66EEE"; // 421614 in hex

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

          // Check current network
          const network = await ethProvider.getNetwork();
          const currentChainId = network.chainId.toString(16).toUpperCase();

          if (currentChainId !== ARBITRUM_SEPOLIA_CHAIN_ID.substring(2)) {
            console.log(`🌐 Wrong network detected: ${network.name} (${currentChainId})`);
            console.log(`🔄 Switching to Arbitrum Sepolia...`);

            try {
              await (window as any).ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }],
              });
              console.log("✅ Successfully switched to Arbitrum Sepolia");
              setNetworkError(null);
            } catch (switchError: any) {
              // This error code indicates that the chain has not been added to MetaMask
              if (switchError.code === 4902) {
                console.log("🔗 Adding Arbitrum Sepolia network to wallet...");
                try {
                  await (window as any).ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
                      chainName: 'Arbitrum Sepolia',
                      nativeCurrency: {
                        name: 'Ethereum',
                        symbol: 'ETH',
                        decimals: 18,
                      },
                      rpcUrls: ['https://arbitrum-sepolia.drpc.org'],
                      blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
                    }],
                  });
                  console.log("✅ Arbitrum Sepolia network added successfully");
                  setNetworkError(null);
                } catch (addError) {
                  console.error("Failed to add network:", addError);
                  setNetworkError("Failed to add Arbitrum Sepolia network. Please add it manually in your wallet.");
                }
              } else {
                console.error("Failed to switch network:", switchError);
                setNetworkError(`Please switch to Arbitrum Sepolia network manually. Current: ${network.name}`);
              }
            }
          } else {
            console.log("✅ Connected to Arbitrum Sepolia");
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
