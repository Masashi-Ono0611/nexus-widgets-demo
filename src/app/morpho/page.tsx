"use client";

import React from "react";
import { MorphoVaultControls } from "./_components/Controls";
import { MorphoVaultFeedback, MorphoVaultStatePanels } from "./_components/StatePanels";
import { CONTRACT_ADDRESS } from "./config";
import { useMorphoVault } from "./useMorphoVault";

export default function MorphoVaultPage() {
  const {
    account,
    assetAddress,
    depositAmount,
    withdrawAmount,
    vaultShares,
    vaultSharesValue,
    totalAssets,
    tokenBalance,
    allowance,
    status,
    error,
    setAssetAddress,
    setDepositAmount,
    setWithdrawAmount,
    handleConnect,
    handleApprove,
    handleDeposit,
    handleWithdraw,
    refreshTokenInfo,
    refreshVaultInfo,
  } = useMorphoVault();

  return (
    <main className="container">
      <h1 className="header">Morpho Vault v2 (Arbitrum Sepolia)</h1>
      <p className="subheader">
        Interact with the Morpho Vault v2 contract at {CONTRACT_ADDRESS}. Use the form below to
        approve tokens, deposit, withdraw, and inspect balances.
      </p>

      <MorphoVaultControls
        account={account}
        assetAddress={assetAddress}
        depositAmount={depositAmount}
        withdrawAmount={withdrawAmount}
        onChangeAsset={(value) => setAssetAddress(value)}
        onChangeDeposit={(value) => setDepositAmount(value)}
        onChangeWithdraw={(value) => setWithdrawAmount(value)}
        onConnect={handleConnect}
        onApprove={handleApprove}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        onRefreshToken={refreshTokenInfo}
        onRefreshVault={refreshVaultInfo}
      />

      <MorphoVaultStatePanels
        tokenBalance={tokenBalance}
        allowance={allowance}
        vaultShares={vaultShares}
        vaultSharesValue={vaultSharesValue}
        totalAssets={totalAssets}
      />

      <MorphoVaultFeedback status={status} error={error} />
    </main>
  );
}

