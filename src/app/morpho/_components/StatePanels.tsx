"use client";

import React from "react";

interface StatePanelsProps {
  tokenBalance: string;
  allowance: string;
  vaultShares: string;
  vaultSharesValue: string;
  totalAssets: string;
}

export function MorphoVaultStatePanels({
  tokenBalance,
  allowance,
  vaultShares,
  vaultSharesValue,
  totalAssets,
}: StatePanelsProps) {
  return (
    <section className="card" style={{ marginTop: 16 }}>
      <h3>Current State</h3>
      <div className="form-group" style={{ marginTop: 12 }}>
        <label className="form-label">Token balance</label>
        <div className="form-input">{tokenBalance}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Allowance to Morpho Vault</label>
        <div className="form-input">{allowance}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Your vault shares</label>
        <div className="form-input">{vaultShares}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Shares value (in assets)</label>
        <div className="form-input">{vaultSharesValue}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Total vault assets</label>
        <div className="form-input">{totalAssets}</div>
      </div>
    </section>
  );
}

interface FeedbackProps {
  status: string;
  error: string;
}

export function MorphoVaultFeedback({ status, error }: FeedbackProps) {
  return (
    <>
      {status && (
        <section className="card" style={{ marginTop: 16 }}>
          <h3>Status</h3>
          <div className="form-input" style={{ marginTop: 12 }}>{status}</div>
        </section>
      )}

      {error && (
        <section className="card" style={{ marginTop: 16 }}>
          <h3>Error</h3>
          <div className="form-error" style={{ marginTop: 12 }}>{error}</div>
        </section>
      )}
    </>
  );
}
