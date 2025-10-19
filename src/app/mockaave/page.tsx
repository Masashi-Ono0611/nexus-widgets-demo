"use client";

import React from "react";
import { MockAaveControls } from "./_components/Controls";
import { MockAaveFeedback, MockAaveStatePanels } from "./_components/StatePanels";
import { CONTRACT_ADDRESS } from "./config";
import { useMockAave } from "./useMockAave";

export default function MockAavePage() {
  const {
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
  } = useMockAave();

  return (
    <main className="container">
      <h1 className="header">Mock AAVE (Base Sepolia)</h1>
      <p className="subheader">
        Interact with the deployed `MockAavePool` contract at {CONTRACT_ADDRESS}. Use the form below to
        approve tokens, supply, withdraw, and inspect balances.
      </p>

      <MockAaveControls
        account={account}
        assetAddress={assetAddress}
        supplyAmount={supplyAmount}
        withdrawAmount={withdrawAmount}
        onChangeAsset={(value) => setAssetAddress(value)}
        onChangeSupply={(value) => setSupplyAmount(value)}
        onChangeWithdraw={(value) => setWithdrawAmount(value)}
        onConnect={handleConnect}
        onApprove={handleApprove}
        onSupply={handleSupply}
        onWithdraw={handleWithdraw}
        onRefreshToken={refreshTokenInfo}
        onRefreshSupply={refreshSupplyInfo}
      />

      <MockAaveStatePanels
        tokenBalance={tokenBalance}
        allowance={allowance}
        supplyBalance={supplyBalance}
        totalSupplied={totalSupplied}
      />

      <MockAaveFeedback status={status} error={error} />
    </main>
  );
}
