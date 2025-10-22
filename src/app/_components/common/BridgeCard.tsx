"use client";
import React from "react";
import { BridgeButton } from "@avail-project/nexus-widgets";
import styles from "../../components.module.css";

export function BridgeCard() {
  return (
    <div className="card">
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>🌉</div>
        <div>
          <h3 className={styles.cardTitle}>Bridge Tokens</h3>
          <span className={`${styles.cardBadge} ${styles.badgePrimary}`}>Cross-Chain</span>
        </div>
      </div>
      <p className={styles.cardDescription}>
        Seamlessly transfer your tokens across multiple blockchain networks with secure bridging.
      </p>
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
