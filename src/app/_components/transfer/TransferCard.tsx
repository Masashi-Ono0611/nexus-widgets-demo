"use client";
import React from "react";
import { TransferButton, type TransferParams } from "@avail-project/nexus-widgets";
import styles from "../../components.module.css";

interface TransferCardProps {
  prefill?: Partial<TransferParams>;
}

export function TransferCard({ prefill }: TransferCardProps) {
  return (
    <div className="card">
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>💸</div>
        <div>
          <h3 className={styles.cardTitle}>Transfer Tokens</h3>
          <span className={`${styles.cardBadge} ${styles.badgePrimary}`}>Single Chain</span>
        </div>
      </div>
      <p className={styles.cardDescription}>
        Send tokens to any address on the same blockchain network instantly.
      </p>
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
