"use client";
import React from "react";
import styles from "../../footer.module.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Toke Of App</h4>
          <p className={styles.footerDescription}>
            A PayFi App with Multi-Wallet Distribution, Multi-Strategy Allocation, and Automated Recurring from Multiple Chains
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

      </div>

      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          © {currentYear} Toke Of App. Built with ❤️ for PayFi.
        </p>
      </div>
    </footer>
  );
}
