"use client";
import React from "react";
import { GiftingSplitterArbitrumCard } from "../_components/gifting/GiftingSplitterArbitrumCard";

export default function GiftingPage() {
  return (
    <main className="container">
      <div>
        <h1 className="header">🎁 Gifting</h1>
        <p className="subheader-main">
          Distribute USDC to multiple recipients with percentage-based allocation
        </p>
      </div>
      <GiftingSplitterArbitrumCard />
    </main>
  );
}
