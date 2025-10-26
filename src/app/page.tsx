"use client";
import React from "react";
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from "./_components/gifting/design-tokens";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-6">
          <h1 className={`text-4xl md:text-5xl ${COLORS.textPrimary} ${FONT_WEIGHTS.pageTitle}`}>
            Toke Of App
          </h1>
          <p className={`text-lg ${COLORS.textSecondary} max-w-3xl mx-auto ${FONT_SIZES.bodyLarge}`}>
            A PayFi App with Multi-Wallet Distribution, Multi-Strategy Allocation, and Automated Recurring from Multiple Chains
          </p>
        </div>

        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Payroll Card */}
          <div className={`p-8 ${COLORS.backgroundPrimary} rounded-2xl shadow-lg ${COLORS.borderPrimary} border hover:shadow-xl transition-all duration-300 hover:scale-105`}>
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 ${COLORS.brand.recipientPrimary.background} rounded-full flex items-center justify-center mx-auto`}>
                <span className="text-2xl">💼</span>
              </div>
              <h3 className={`text-2xl ${FONT_WEIGHTS.sectionHeading} ${COLORS.textPrimary}`}>
                Payroll Manager
              </h3>
              <p className={`${FONT_SIZES.bodyLarge} ${COLORS.textSecondary}`}>
                Send payments to multiple team members simultaneously with automated recurring schedules and DeFi strategy allocation
              </p>
              <a
                href="/payroll"
                className={`inline-flex items-center justify-center rounded-lg ${FONT_SIZES.buttonMedium} ${FONT_WEIGHTS.button} ${COLORS.brand.recipientPrimary.text} ${COLORS.brand.recipientPrimary.background} ${COLORS.brand.recipientPrimary.border} ${COLORS.brand.recipientPrimary.hover} px-8 py-3 transition-all duration-200`}
              >
                Open Payroll
              </a>
            </div>
          </div>

          {/* Gifting Card */}
          <div className={`p-8 ${COLORS.backgroundPrimary} rounded-2xl shadow-lg ${COLORS.borderPrimary} border hover:shadow-xl transition-all duration-300 hover:scale-105`}>
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 ${COLORS.brand.recipientPrimary.background} rounded-full flex items-center justify-center mx-auto`}>
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className={`text-2xl ${FONT_WEIGHTS.sectionHeading} ${COLORS.textPrimary}`}>
                Gifting Manager
              </h3>
              <p className={`${FONT_SIZES.bodyLarge} ${COLORS.textSecondary}`}>
                Allocate funds to multiple recipients with percentage-based distribution and DeFi strategy optimization across different protocols
              </p>
              <a
                href="/gifting"
                className={`inline-flex items-center justify-center rounded-lg ${FONT_SIZES.buttonMedium} ${FONT_WEIGHTS.button} ${COLORS.brand.recipientPrimary.text} ${COLORS.brand.recipientPrimary.background} ${COLORS.brand.recipientPrimary.border} ${COLORS.brand.recipientPrimary.hover} px-8 py-3 transition-all duration-200`}
              >
                Open Gifting
              </a>
            </div>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="text-center space-y-6">
          <h2 className={`text-3xl ${FONT_WEIGHTS.sectionHeading} ${COLORS.textPrimary}`}>
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 ${COLORS.backgroundSecondary} rounded-xl ${COLORS.borderPrimary} border`}>
              <div className={`text-3xl mb-3`}>👛</div>
              <h4 className={`${FONT_SIZES.sectionHeading} ${COLORS.textPrimary} mb-2`}>Multi-Wallet Distribution</h4>
              <p className={`${FONT_SIZES.bodySmall} ${COLORS.textSecondary}`}>Send payments to multiple recipients simultaneously</p>
            </div>
            <div className={`p-6 ${COLORS.backgroundSecondary} rounded-xl ${COLORS.borderPrimary} border`}>
              <div className={`text-3xl mb-3`}>📊</div>
              <h4 className={`${FONT_SIZES.sectionHeading} ${COLORS.textPrimary} mb-2`}>Multi-Strategy Allocation</h4>
              <p className={`${FONT_SIZES.bodySmall} ${COLORS.textSecondary}`}>Allocate funds across different DeFi protocols (AAVE, Morpho, Uniswap)</p>
            </div>
            <div className={`p-6 ${COLORS.backgroundSecondary} rounded-xl ${COLORS.borderPrimary} border`}>
              <div className={`text-3xl mb-3`}>⏰</div>
              <h4 className={`${FONT_SIZES.sectionHeading} ${COLORS.textPrimary} mb-2`}>Automated Recurring</h4>
              <p className={`${FONT_SIZES.bodySmall} ${COLORS.textSecondary}`}>Schedule recurring payments with customizable intervals</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

