"use client";

import React from "react";

interface ControlsProps {
  account: string | null;
  assetAddress: string;
  supplyAmount: string;
  withdrawAmount: string;
  onChangeAsset(asset: string): void;
  onChangeSupply(amount: string): void;
  onChangeWithdraw(amount: string): void;
  onConnect(): void | Promise<void>;
  onApprove(): void | Promise<void>;
  onSupply(): void | Promise<void>;
  onWithdraw(): void | Promise<void>;
  onRefreshToken(): void | Promise<void>;
  onRefreshSupply(): void | Promise<void>;
}

export function MockAaveControls({
  account,
  assetAddress,
  supplyAmount,
  withdrawAmount,
  onChangeAsset,
  onChangeSupply,
  onChangeWithdraw,
  onConnect,
  onApprove,
  onSupply,
  onWithdraw,
  onRefreshToken,
  onRefreshSupply,
}: ControlsProps) {
  const disabled = !account;

  return (
    <div className="card">
      <div className="form-container">
        <div className="form-group">
          <label className="form-label">Connected account</label>
          <div className="form-input">{account ?? "Not connected"}</div>
          <button className="btn btn-primary" onClick={onConnect}>
            Connect Wallet
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Asset address</label>
          <input
            className="form-input"
            value={assetAddress}
            onChange={(event) => onChangeAsset(event.target.value)}
            placeholder="0x..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Supply amount</label>
          <input
            className="form-input"
            value={supplyAmount}
            onChange={(event) => onChangeSupply(event.target.value)}
            placeholder="Token amount (e.g. 1.5)"
          />
          <div className="button-group">
            <button className="btn btn-accent" onClick={onApprove} disabled={disabled}>
              Approve
            </button>
            <button className="btn btn-primary" onClick={onSupply} disabled={disabled}>
              Supply
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Withdraw amount</label>
          <input
            className="form-input"
            value={withdrawAmount}
            onChange={(event) => onChangeWithdraw(event.target.value)}
            placeholder="Token amount (e.g. 1.0)"
          />
          <button className="btn btn-primary" onClick={onWithdraw} disabled={disabled}>
            Withdraw
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Refresh balances</label>
          <div className="button-group">
            <button className="btn btn-primary" onClick={onRefreshToken} disabled={disabled}>
              Token Balance &amp; Allowance
            </button>
            <button className="btn btn-primary" onClick={onRefreshSupply} disabled={disabled}>
              Supply Balances
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
