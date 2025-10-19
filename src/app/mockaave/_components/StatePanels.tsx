"use client";

import React from "react";

interface StatePanelsProps {
  tokenBalance: string;
  allowance: string;
  supplyBalance: string;
  totalSupplied: string;
}

export function MockAaveStatePanels({
  tokenBalance,
  allowance,
  supplyBalance,
  totalSupplied,
}: StatePanelsProps) {
  return (
    <section className="card" style={{ marginTop: 16 }}>
      <h3>Current State</h3>
      <div className="form-group" style={{ marginTop: 12 }}>
        <label className="form-label">Token balance</label>
        <div className="form-input">{tokenBalance}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Allowance to MockAavePool</label>
        <div className="form-input">{allowance}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Your supplied balance</label>
        <div className="form-input">{supplyBalance}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Total supplied</label>
        <div className="form-input">{totalSupplied}</div>
      </div>
    </section>
  );
}

interface FeedbackProps {
  status: string;
  error: string;
}

export function MockAaveFeedback({ status, error }: FeedbackProps) {
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
