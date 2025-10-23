"use client";
import React from "react";
import { GiftingSplitterArbitrumCard } from "./_components/gifting/GiftingSplitterArbitrumCard";

export default function Home() {
  return (
    <main className="container">
      <div>
        <h1 className="header">Top</h1>
        <p className="subheader-main">Choose a section</p>
      </div>

      <div className="action-bar">
        <a href="/payroll" className="btn btn-primary">
          Go to Payroll
        </a>
        <a href="/gifting" className="btn btn-primary">
          Go to Gifting
        </a>
        <a href="/tools" className="btn btn-secondary">
          Go to Tools
        </a>
      </div>
    </main>
  );
}

