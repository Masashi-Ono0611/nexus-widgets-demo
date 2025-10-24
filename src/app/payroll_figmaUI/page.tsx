"use client";
import React from "react";
import { Toaster } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { PayrollManager } from "../_components/payroll_figmaUI/PayrollManager";
import { COLORS } from "../_components/payroll_figmaUI/design-tokens";

export default function PayrollPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          <h1 className={`text-4xl md:text-5xl ${COLORS.textPrimary} font-bold`}>
            Payroll Manager
          </h1>
          <p className={`text-lg ${COLORS.textSecondary} max-w-3xl mx-auto`}>
            Multi-wallet payroll with DeFi strategies, recurring payments, and cross-chain USDC bridging
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

        {/* Main Payroll Manager */}
        <PayrollManager />
      </div>
      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
