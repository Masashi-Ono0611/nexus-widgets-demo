"use client";
import React from "react";
import Link from "next/link";
import styles from "../../navbar.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>🔗 Toke Of App</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
