"use client";
import React from "react";
import styles from "../../navbar.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <div className={styles.logo}>
          <span className={styles.logoText}>🔗 Toke of App</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
