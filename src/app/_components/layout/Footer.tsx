"use client";
import React from "react";
import styles from "../../footer.module.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Avail Nexus</h4>
          <p className={styles.footerDescription}>
            Cross-chain DeFi hub for seamless token bridging, lending, and yield farming.
          </p>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Resources</h4>
          <ul className={styles.footerLinks}>
            <li>
              <a
                href="https://github.com/Masashi-Ono0611/nexus-widgets-demo"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                GitHub Repository
              </a>
            </li>
            <li>
              <a
                href="https://docs.availproject.org"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Documentation
              </a>
            </li>
            <li>
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                USDC Faucet
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Supported Networks</h4>
          <ul className={styles.footerLinks}>
            <li>Base Sepolia</li>
            <li>Optimism Sepolia</li>
            <li>Arbitrum Sepolia</li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          © {currentYear} Avail Nexus. Built with ❤️ for cross-chain DeFi.
        </p>
      </div>
    </footer>
  );
}
