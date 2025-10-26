"use client";
import React from "react";
import { Button } from "../ui/button";

interface NetworkGateModalProps {
  isOpen: boolean;
  address: string | null;
  isCorrectNetwork: boolean;
  onConnectWallet: () => Promise<void>;
  onSwitchNetwork: () => Promise<void>;
  networkName?: string;
}

export function NetworkGateModal({
  isOpen,
  address,
  isCorrectNetwork,
  onConnectWallet,
  onSwitchNetwork,
  networkName = "Arbitrum Sepolia"
}: NetworkGateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Setup Required
          </h2>
          <p className="text-gray-600">
            Please complete the following steps to continue
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {/* Step 1: Wallet Connection */}
          <div className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              address ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              {address ? "✓" : "1"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">
                Connect Wallet
              </h3>
              {!address ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Connect your wallet to get started
                  </p>
                  <Button
                    onClick={onConnectWallet}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Connect Wallet
                  </Button>
                </>
              ) : (
                <p className="text-sm text-green-600 font-medium">
                  Connected: {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>
          </div>

          {/* Step 2: Network Switch */}
          <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
            !address ? "border-gray-200 bg-gray-50 opacity-50" : "border-gray-200 bg-gray-50"
          }`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              isCorrectNetwork ? "bg-green-500 text-white" : address ? "bg-gray-300 text-gray-600" : "bg-gray-200 text-gray-400"
            }`}>
              {isCorrectNetwork ? "✓" : "2"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">
                Switch to {networkName}
              </h3>
              {!address ? (
                <p className="text-sm text-gray-400">
                  Connect wallet first
                </p>
              ) : !isCorrectNetwork ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Switch your wallet to {networkName}
                  </p>
                  <Button
                    onClick={onSwitchNetwork}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Switch Network
                  </Button>
                </>
              ) : (
                <p className="text-sm text-green-600 font-medium">
                  Connected to {networkName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        {address && isCorrectNetwork && (
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              ✨ All set! Loading page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
