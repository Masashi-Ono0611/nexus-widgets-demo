"use client";
import React from "react";
import { BridgeButton } from "@avail-project/nexus-widgets";

export function BridgeCard() {
  return (
    <div className="card">
      <h3>Bridge Tokens</h3>
      <BridgeButton>
        {({ onClick, isLoading }) => (
          <button
            onClick={async () => {
              await onClick();
            }}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? "Bridging…" : "Open Bridge"}
          </button>
        )}
      </BridgeButton>
    </div>
  );
}
