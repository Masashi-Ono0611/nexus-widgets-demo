"use client";
import React from "react";
import { type TransferParams } from "@avail-project/nexus-widgets";
import { TransferCard } from "@/app/_components/TransferCard";

interface ReceiveClientProps {
  prefill?: Partial<TransferParams>;
}

export function ReceiveClient({ prefill }: ReceiveClientProps) {
  return (
    <main className="container">
      <h1 className="header">Receive Tokens</h1>
      <section className="grid">
        <TransferCard prefill={prefill} />
      </section>
    </main>
  );
}
