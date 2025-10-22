"use client";
import React from "react";
import { type TransferParams } from "@avail-project/nexus-widgets";
import { TransferCard } from "@/app/_components/transfer/TransferCard";

interface ReceiveClientProps {
  prefill?: Partial<TransferParams>;
}

export function ReceiveClient({ prefill }: ReceiveClientProps) {
  return (
    <main className="container">
      <h1 className="header">Token Appreciation🎁</h1>
      <p className="subheader">
        Send token appreciation from any chain you prefer.
      </p>
      <section className="grid">
        <TransferCard prefill={prefill} />
      </section>
    </main>
  );
}
