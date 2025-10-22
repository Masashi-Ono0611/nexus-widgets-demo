"use client";
import React from "react";
import { FlexibleSplitterArbitrumCard } from "../_components/splitter/FlexibleSplitterArbitrumCard";
import { RecurringSplitterArbitrumCard } from "../_components/scheduled/RecurringSplitterArbitrumCard";

export default function PayrollPage() {
  return (
    <main className="container">
      <div>
        <h1 className="header">Payroll</h1>
        <p className="subheader-main">
          Configure multi-wallet distributions with multiple strategies and time-based schedules.
        </p>
      </div>

      <section className="grid">
        <FlexibleSplitterArbitrumCard />
        <RecurringSplitterArbitrumCard />
      </section>
    </main>
  );
}
