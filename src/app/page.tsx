"use client";
import React from "react";
import { GiftingSplitterArbitrumCard } from "./_components/gifting/GiftingSplitterArbitrumCard";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4">
      <div>
        <h1 className="header">Choose your path</h1>
        <p className="subheader-main">Select where your next impact begins</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6 mt-8">
        <a href="/payroll" className="btn1 btn-primary">Go To Payroll</a>
        <a href="/gifting" className="btn1 btn-primary">Go To Gifting</a>
        <a href="/tools" className="btn1 btn-secondary">Go To Tools</a>
      </div>
    </main>
  );
}