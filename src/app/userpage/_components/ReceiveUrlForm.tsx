"use client";
import React from "react";

interface ReceiveUrlFormProps {
  onGenerate: (params: { to: string; chainId: string; token: string }) => void;
}

const SUPPORTED_CHAINS = [
  { id: "1", name: "Ethereum" },
  { id: "8453", name: "Base" },
  { id: "42161", name: "Arbitrum" },
  { id: "10", name: "Optimism" },
  { id: "137", name: "Polygon" },
  { id: "43114", name: "Avalanche" },
  { id: "534352", name: "Scroll" },
  { id: "11155111", name: "Sepolia" },
  { id: "84532", name: "Base Sepolia" },
  { id: "421614", name: "Arbitrum Sepolia" },
  { id: "11155420", name: "Optimism Sepolia" },
  { id: "80002", name: "Polygon Amoy" },
];

const SUPPORTED_TOKENS = ["ETH", "USDC", "USDT"];

export function ReceiveUrlForm({ onGenerate }: ReceiveUrlFormProps) {
  const [walletAddress, setWalletAddress] = React.useState("");
  const [chainId, setChainId] = React.useState("84532");
  const [token, setToken] = React.useState("USDC");
  const [error, setError] = React.useState("");

  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!walletAddress) {
      setError("Wallet address is required");
      return;
    }

    if (!validateAddress(walletAddress)) {
      setError("Invalid wallet address format");
      return;
    }

    onGenerate({
      to: walletAddress,
      chainId,
      token,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="walletAddress" className="form-label">
          Wallet Address
        </label>
        <input
          id="walletAddress"
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="chainId" className="form-label">
          Chain
        </label>
        <select
          id="chainId"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
          className="form-select"
        >
          {SUPPORTED_CHAINS.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="token" className="form-label">
          Token
        </label>
        <select
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="form-select"
        >
          {SUPPORTED_TOKENS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" className="btn btn-primary">
        Generate Receive URL
      </button>
    </form>
  );
}
