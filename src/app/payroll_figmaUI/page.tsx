"use client";
import React from "react";
import { Toaster } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { PayrollManager } from "../_components/payroll_figmaUI/PayrollManager";

export default function PayrollPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl md:text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Payroll Manager
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Configure wallet groups with DeFi strategy allocations, execute one-off distributions
            or schedule recurring payments with cross-chain USDC bridging powered by Nexus Widgets
          </p>

          {/* Info Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm">
                <span className="text-gray-500">Network:</span>{' '}
                <span className="font-semibold text-blue-600">Arbitrum Sepolia</span>
              </span>
            </div>
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm">
                <span className="text-gray-500">Token:</span>{' '}
                <span className="font-semibold text-green-600">USDC</span>
              </span>
            </div>
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm">
                <span className="text-gray-500">Max Recipients:</span>{' '}
                <span className="font-semibold text-purple-600">5 Wallets</span>
              </span>
            </div>
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm">
                <span className="text-gray-500">Strategies:</span>{' '}
                <span className="font-semibold text-orange-600">4 DeFi Protocols</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Payroll Manager */}
        <PayrollManager />

        {/* Smart Contracts - Collapsible */}
        <Collapsible className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <h3 className="text-lg font-semibold">Smart Contracts</h3>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">FlexibleSplitter</div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                      0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454
                    </code>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">RecurringSplitter</div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                      0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E
                    </code>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">PayrollConfigRegistry</div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                      0x1d5dF7B4553c78318DB8F4833BD22fE92E32F2D7
                    </code>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* DeFi Strategies Overview - Collapsible */}
        <Collapsible>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <h3 className="text-lg font-semibold">DeFi Strategies</h3>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h4 className="font-semibold mb-1">Direct Transfer</h4>
                    <p className="text-xs text-gray-600">Send tokens directly to recipients</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold mb-1">AAVE Supply</h4>
                    <p className="text-xs text-gray-600">Supply to AAVE lending protocol</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className="font-semibold mb-1">Morpho Deposit</h4>
                    <p className="text-xs text-gray-600">Deposit to Morpho Vault for yield</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                      <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h4 className="font-semibold mb-1">Uniswap Swap</h4>
                    <p className="text-xs text-gray-600">Swap USDC to WETH on Uniswap V2</p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
