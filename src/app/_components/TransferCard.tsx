"use client";
import React from "react";
import { TransferButton, type TransferParams } from "@avail-project/nexus-widgets";

interface TransferCardProps {
  prefill?: Partial<TransferParams>;
}

export function TransferCard({ prefill }: TransferCardProps) {
  return (
    <div className="card">
      <h3>Transfer Tokens</h3>
      <TransferButton prefill={prefill}>
        {({ onClick, isLoading }) => (
          <button
            onClick={async () => {
              await onClick();
            }}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? "Opening…" : "Open Transfer"}
          </button>
        )}
      </TransferButton>
    </div>
  );
}
